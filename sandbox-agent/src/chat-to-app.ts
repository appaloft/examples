import { appaloft, requiredEnv, unwrap } from "./client.js";

type Sandbox = { sandboxId: string; status: string };
type Runtime = { runtimeId: string; sandboxId: string; status: string };
type Run = { runId: string; runtimeId: string; sandboxId: string; status: string };

// Your product owns the chat and user session. Appaloft owns the isolated
// workspace, the Pi process, Run lifecycle, events, and cleanup.
const sandbox = unwrap<Sandbox>(
  await appaloft.sandboxes.create<Sandbox>({
    source: {
      kind: "template",
      templateId: requiredEnv("APPALOFT_SANDBOX_TEMPLATE_ID"),
    },
    requestedIsolation: "gvisor",
    limits: {
      cpuMillis: 2_000,
      memoryBytes: 2_147_483_648,
      diskBytes: 10_737_418_240,
      maxProcesses: 128,
    },
    networkPolicy: { mode: "deny", rules: [] },
    expiresAt: new Date(Date.now() + 60 * 60 * 1_000).toISOString(),
  }),
);

const runtime = unwrap<Runtime>(
  await appaloft.sandboxes.agents.runtimes.create<Runtime>({
    sandboxId: sandbox.sandboxId,
    harnessKey: "pi",
    harnessTemplateId: requiredEnv("APPALOFT_PI_HARNESS_TEMPLATE_ID"),
    idempotencyKey: crypto.randomUUID(),
  }),
);

const run = unwrap<Run>(
  await appaloft.sandboxes.agents.runs.create<Run>({
    sandboxId: sandbox.sandboxId,
    runtimeId: runtime.runtimeId,
    task: requiredEnv("APP_PROMPT"),
    context: { mode: "fresh" },
    idempotencyKey: crypto.randomUUID(),
  }),
);

console.log(JSON.stringify({ sandbox, runtime, run }, null, 2));
console.log(`Read progress with runId=${run.runId}; keep the chat transcript in your application.`);
