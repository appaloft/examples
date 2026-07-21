import { appaloft, requiredEnv } from "./client.js";

// Your product owns the chat and user session. Appaloft owns the isolated
// workspace, the Pi process, Run lifecycle, events, and cleanup.
const sandbox = await appaloft.sandboxes.create({
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
});

const agent = await sandbox.agents.create({ harness: "pi" });
const run = await agent.runs.create({ task: requiredEnv("APP_PROMPT") });

console.log(JSON.stringify({ sandbox, agent, run }, null, 2));
console.log(`Read progress with runId=${run.runId}; keep the chat transcript in your application.`);
