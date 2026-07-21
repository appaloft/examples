import type { AppaloftClient, AppaloftSandbox } from "@appaloft/sdk";
import { pathToFileURL } from "node:url";

export type SandboxProcessFrame =
  | { kind: "stdout" | "stderr"; sequence: number; data: string }
  | { kind: "exit"; sequence: number; exitCode: number }
  | { kind: "error"; sequence: number; code: string; retryable: boolean };

export type SandboxExecResult =
  | { mode: "foreground"; frames: SandboxProcessFrame[] }
  | { mode: "background"; processId: string };

export interface ExecOutcome {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  errorCode: string | null;
  timedOut: boolean;
}

type SandboxFile = { contentBase64: string; sizeBytes: number };

export const DEFAULT_JOB_LIMITS = {
  cpuMillis: 1_000,
  memoryBytes: 256 * 1024 * 1024,
  diskBytes: 256 * 1024 * 1024,
  maxProcesses: 16,
} as const;

export const MAX_STDOUT_CHARS = 64_000;

export async function createSandbox(
  client: AppaloftClient,
  templateId: string,
): Promise<AppaloftSandbox> {
  return client.sandboxes.create({
    source: { kind: "template", templateId },
    requestedIsolation: "gvisor",
    limits: DEFAULT_JOB_LIMITS,
    networkPolicy: { mode: "deny", rules: [] },
    expiresAt: new Date(Date.now() + 15 * 60 * 1_000).toISOString(),
  });
}

export async function terminateSandbox(sandbox: AppaloftSandbox): Promise<void> {
  await sandbox.terminate();
}

export async function writeWorkspaceText(
  sandbox: AppaloftSandbox,
  path: string,
  content: string,
): Promise<void> {
  await sandbox.files.write({
    path,
    contentBase64: Buffer.from(content, "utf8").toString("base64"),
  });
}

export async function readWorkspaceText(
  sandbox: AppaloftSandbox,
  path: string,
): Promise<string> {
  const file = await sandbox.files.read<SandboxFile>({ path });
  return Buffer.from(file.contentBase64, "base64").toString("utf8");
}

export async function execute(
  sandbox: AppaloftSandbox,
  input: { argv: string[]; cwd?: string; timeoutMs: number },
): Promise<ExecOutcome> {
  const result = await sandbox.exec<SandboxExecResult>({
    argv: input.argv,
    ...(input.cwd ? { cwd: input.cwd } : {}),
    timeoutMs: input.timeoutMs,
  });
  if (result.mode !== "foreground") {
    throw new Error("Sandbox job unexpectedly started in background mode");
  }
  return collectExecOutcome(result.frames);
}

export function collectExecOutcome(frames: readonly SandboxProcessFrame[]): ExecOutcome {
  let stdout = "";
  let stderr = "";
  for (const frame of frames) {
    if (frame.kind === "stdout" && stdout.length < MAX_STDOUT_CHARS) {
      stdout += frame.data.slice(0, MAX_STDOUT_CHARS - stdout.length);
    }
    if (frame.kind === "stderr") stderr += frame.data;
  }
  const exit = frames.find(
    (frame): frame is Extract<SandboxProcessFrame, { kind: "exit" }> => frame.kind === "exit",
  );
  const error = frames.find(
    (frame): frame is Extract<SandboxProcessFrame, { kind: "error" }> => frame.kind === "error",
  );
  return {
    stdout,
    stderr,
    exitCode: exit?.exitCode ?? null,
    errorCode: error?.code ?? null,
    timedOut: error?.code === "sandbox_exec_timeout",
  };
}

export function assertSucceeded(outcome: ExecOutcome): void {
  if (outcome.errorCode) throw new Error(`Sandbox execution failed: ${outcome.errorCode}`);
  if (outcome.exitCode !== 0) {
    throw new Error(`Sandbox process exited with code ${outcome.exitCode ?? "unknown"}`);
  }
}

export function isMain(metaUrl: string): boolean {
  return Boolean(process.argv[1]) && metaUrl === pathToFileURL(process.argv[1]).href;
}
