import { readFile } from "node:fs/promises";
import { createClient, requiredEnv } from "./shared/appaloft-client.js";
import {
  createSandbox,
  execute,
  isMain,
  readWorkspaceText,
  terminateSandbox,
  writeWorkspaceText,
  type ExecOutcome,
} from "./shared/sandbox-lifecycle.js";

export const USER_SCRIPT = `export default function transform(input) {
  return {
    customer: input.customer,
    count: input.values.length,
    sum: input.values.reduce((total, value) => total + value, 0),
  };
}
`;

export const SCRIPT_RUNNER = `import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const [scriptPath, inputPath, outputPath] = process.argv.slice(2);
try {
  const input = JSON.parse(await readFile(inputPath, "utf8"));
  const module = await import(pathToFileURL(scriptPath).href);
  if (typeof module.default !== "function") throw new TypeError("script must export a default function");
  const value = await module.default(input);
  await writeFile(outputPath, JSON.stringify({ ok: true, value }, null, 2) + "\\n", "utf8");
  process.stdout.write(JSON.stringify({ status: "ok" }) + "\\n");
} catch (error) {
  const failure = {
    ok: false,
    error: {
      name: error instanceof Error ? error.name : "Error",
      message: error instanceof Error ? error.message : "script failed",
    },
  };
  await writeFile(outputPath, JSON.stringify(failure, null, 2) + "\\n", "utf8");
  process.stderr.write(failure.error.name + ": " + failure.error.message + "\\n");
  process.exitCode = 1;
}
`;

export interface UntrustedScriptResult {
  status: "succeeded" | "failed" | "timed_out";
  stdout: string;
  exitCode: number | null;
  result: Record<string, unknown>;
}

export function statusForOutcome(outcome: ExecOutcome): UntrustedScriptResult["status"] {
  if (outcome.timedOut) return "timed_out";
  if (outcome.errorCode || outcome.exitCode !== 0) return "failed";
  return "succeeded";
}

export async function runUntrustedScript(
  userScript = USER_SCRIPT,
  timeoutMs = 3_000,
): Promise<UntrustedScriptResult> {
  const appaloft = createClient();
  const input = await readFile(new URL("../fixtures/transform-input.json", import.meta.url), "utf8");
  let sandbox: Awaited<ReturnType<typeof createSandbox>> | undefined;

  try {
    sandbox = await createSandbox(
      appaloft,
      requiredEnv("APPALOFT_NODE_SANDBOX_TEMPLATE_ID"),
    );
    await Promise.all([
      writeWorkspaceText(sandbox, "job/user-script.mjs", userScript),
      writeWorkspaceText(sandbox, "job/input.json", input),
      writeWorkspaceText(sandbox, "job/runner.mjs", SCRIPT_RUNNER),
    ]);

    const outcome = await execute(sandbox, {
      argv: [
        "node",
        "/workspace/job/runner.mjs",
        "/workspace/job/user-script.mjs",
        "/workspace/job/input.json",
        "/workspace/job/result.json",
      ],
      cwd: "job",
      timeoutMs,
    });
    const status = statusForOutcome(outcome);

    if (status === "timed_out" || outcome.errorCode) {
      await writeWorkspaceText(
        sandbox,
        "job/result.json",
        JSON.stringify(
          {
            ok: false,
            error: { code: outcome.errorCode ?? "sandbox_execution_failed", timedOut: outcome.timedOut },
          },
          null,
          2,
        ) + "\n",
      );
    }

    const resultText = await readWorkspaceText(sandbox, "job/result.json");
    return {
      status,
      stdout: outcome.stdout,
      exitCode: outcome.exitCode,
      result: JSON.parse(resultText),
    };
  } finally {
    if (sandbox) await terminateSandbox(sandbox);
  }
}

if (isMain(import.meta.url)) {
  runUntrustedScript()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : "Sandbox job failed");
      process.exitCode = 1;
    });
}
