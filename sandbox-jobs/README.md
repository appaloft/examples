# Sandbox Jobs

These examples use an Appaloft Execution Sandbox as a short-lived job worker. They return task
results to the calling SaaS and do not create an Agent Runtime or Promotion.

## Choose the right flow

| Workload | Sandbox | Agent | Promotion |
| --- | --- | --- | --- |
| Existing script execution | ✓ | — | — |
| Natural-language analysis | ✓ | ✓ | — |
| Document processing | ✓ | Optional | — |
| Generate and publish an application | ✓ | ✓ | ✓ |
| Public-web crawler | Waiting for egress allowlist | — | — |

Use direct Sandbox execution when your product already has deterministic code. Add an Agent only
when the task needs model-driven reasoning or tool choice. Add Promotion only when a generated
artifact should become a managed application release.

## Shared call path

```text
SaaS backend
  -> appaloft.sandboxes.create (deny network + resource limits + TTL)
  -> sandbox.files.write (fixtures and deterministic code)
  -> sandbox.exec ({ argv: [...] })
  -> sandbox.files.read (structured result files)
  -> sandbox.terminate (finally)
```

```ts
const sandbox = await appaloft.sandboxes.create({
  // source, isolation, limits, deny-only network policy, and TTL
});
try {
  await sandbox.files.write({ path, contentBase64 });
  const execution = await sandbox.exec({ argv: ["python3", "/workspace/job/analyze.py"] });
  const result = await sandbox.files.read({ path: "job/out/summary.json" });
} finally {
  await sandbox.terminate();
}
```

## Prerequisites and environment

- Node.js 20+ and Bun for the caller.
- Appaloft 1.2+ with Execution Sandbox API access.
- An offline Python template containing `python3` for the first two examples.
- An offline Node template containing `node` for the script runner.
- Templates must already exist on the Appaloft operator. The jobs perform no runtime installation.

```bash
cp .env.example .env
export APPALOFT_API_URL="https://your-control-plane.example/api"
export APPALOFT_SESSION_COOKIE="your-product-session-cookie"
export APPALOFT_PYTHON_SANDBOX_TEMPLATE_ID="your-python-template-id"
export APPALOFT_NODE_SANDBOX_TEMPLATE_ID="your-node-template-id"
bun install --frozen-lockfile
```

Keep the session cookie in the SaaS backend. Do not expose it to browsers, upload it to the
workspace, or print it in logs.

## 1. Code interpreter

**User story.** A reporting SaaS receives a CSV and needs a repeatable analysis without handing
the data or code to a model.

**Call path.** The caller uploads [`fixtures/sales.csv`](./fixtures/sales.csv) and a Python standard
library script, executes `python3` with an argv array, then reads all outputs before cleanup. No Pi
or Agent Runtime is created.

**Input and output.** Input is one CSV. Outputs are `summary.json`, `anomalies.csv`, and a standalone
`chart.svg`; the caller returns their decoded contents. The SVG uses only Python's standard library.

**Security boundary.** The Sandbox starts with `networkPolicy: { mode: "deny", rules: [] }`, fixed
CPU/memory/disk/process limits, a 15-minute TTL, and a 10-second exec timeout. CSV parsing remains
application code, so its validation rules are still your responsibility.

```bash
bun run code-interpreter
```

Source: [`src/code-interpreter.ts`](./src/code-interpreter.ts)

## 2. Document processing

**User story.** A back-office SaaS extracts and reconciles a known invoice text format inside an
isolated, disconnected worker.

**Call path.** The caller writes the repository's safe offline fixture and deterministic extractor,
runs `python3`, then reads `invoices.json` and `report.md`.

**Input and output.** Input is [`fixtures/invoice-document.txt`](./fixtures/invoice-document.txt).
The JSON contains normalized invoice fields and line items; the Markdown report records the
reconciliation result.

**Security boundary and template requirement.** This is not a PDF or OCR claim. The default example
only parses a known UTF-8 text format and makes no network request. Real PDF parsing requires a
prebuilt, reviewed Sandbox Template containing the chosen PDF tool. Scanned documents additionally
require a prebuilt OCR tool and language data. The API does not install or download those tools at
runtime, and no OCR SaaS is used.

```bash
bun run document-processing
```

Source: [`src/document-processing.ts`](./src/document-processing.ts)

## 3. Untrusted script runner

**User story.** An automation SaaS lets a customer submit a small JavaScript transform and returns
its stdout, exit code, and structured result.

**Call path.** The caller writes the submitted module, input JSON, and a fixed runner, then invokes
`node` with an argv array. Success and ordinary script failures produce `result.json`. A Sandbox
timeout has no process exit frame, so `exitCode` is accurately returned as `null` and the caller
writes a structured timeout result before reading it.

**Input and output.** Input is [`fixtures/transform-input.json`](./fixtures/transform-input.json) plus
the example module. Output has `status`, bounded stdout, `exitCode`, and parsed `result.json`.

**Security boundary.** Sandbox creation limits CPU to 1 core, memory and disk to 256 MiB, processes
to 16, denies network, and the exec call has a 3-second timeout. No command is assembled as a shell
string. `container-trusted` is only appropriate for trusted or single-tenant jobs; it must not be
presented as hostile multi-tenant security. Use an operator-supported stronger isolation level such
as gVisor/Kata/microVM plus defense in depth for adversarial tenants. This example requests gVisor,
but actual availability depends on the operator and Template.

```bash
bun run untrusted-script-runner
```

Source: [`src/untrusted-script-runner.ts`](./src/untrusted-script-runner.ts)

## Cleanup and current limitations

Every entry point terminates the Sandbox in `finally`, including API errors, script failures, and
timeouts after creation. The 15-minute TTL is a secondary safety net, not the primary cleanup path.

Appaloft does not yet expose a general Result Artifact for these jobs. Read every required workspace
file before `sandbox.terminate()` or TTL expiry; termination removes the ephemeral workspace.
Small stdout is returned directly, while structured results are written to the workspace and read
through the file API.

All examples default to a deny-only network policy. They do not implement or claim a public-web
crawler, Browser QA, or npm dependency upgrade. Those flows wait for a completed egress allowlist
and an appropriate reviewed Template.

## Test

The tests execute the same deterministic Python and Node scripts locally without network access and
verify the SDK lifecycle contracts, including failures and timeout normalization.

```bash
bun run typecheck
bun run test
```
