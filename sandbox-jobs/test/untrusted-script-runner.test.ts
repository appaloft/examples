import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  SCRIPT_RUNNER,
  USER_SCRIPT,
  statusForOutcome,
} from "../src/untrusted-script-runner.js";
import {
  collectExecOutcome,
  DEFAULT_JOB_LIMITS,
  MAX_STDOUT_CHARS,
} from "../src/shared/sandbox-lifecycle.js";

async function executeLocally(script: string) {
  const directory = await mkdtemp(join(tmpdir(), "appaloft-script-runner-"));
  const runnerPath = join(directory, "runner.mjs");
  const scriptPath = join(directory, "user-script.mjs");
  const inputPath = join(directory, "input.json");
  const outputPath = join(directory, "result.json");
  await Promise.all([
    writeFile(runnerPath, SCRIPT_RUNNER, "utf8"),
    writeFile(scriptPath, script, "utf8"),
    writeFile(inputPath, '{"customer":"Example Labs","values":[3,5,8,13]}\n', "utf8"),
  ]);
  const run = spawnSync(process.execPath, [runnerPath, scriptPath, inputPath, outputPath], {
    encoding: "utf8",
  });
  const result = JSON.parse(await readFile(outputPath, "utf8"));
  await rm(directory, { recursive: true, force: true });
  return { run, result };
}

test("script runner returns stdout, exit code, and result JSON", async () => {
  const { run, result } = await executeLocally(USER_SCRIPT);
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /"status":"ok"/);
  assert.deepEqual(result, {
    ok: true,
    value: { customer: "Example Labs", count: 4, sum: 29 },
  });
});

test("script runner records failures and normalizes timeout frames", async () => {
  const { run, result } = await executeLocally(
    'export default function () { throw new Error("fixture failure"); }\n',
  );
  assert.equal(run.status, 1);
  assert.deepEqual(result, {
    ok: false,
    error: { name: "Error", message: "fixture failure" },
  });

  const timeout = collectExecOutcome([
    { kind: "stdout", sequence: 1, data: "partial output\n" },
    { kind: "error", sequence: 2, code: "sandbox_exec_timeout", retryable: false },
  ]);
  assert.equal(statusForOutcome(timeout), "timed_out");
  assert.equal(timeout.exitCode, null);
  assert.equal(timeout.stdout, "partial output\n");

  const bounded = collectExecOutcome([
    { kind: "stdout", sequence: 1, data: "x".repeat(MAX_STDOUT_CHARS + 10) },
    { kind: "exit", sequence: 2, exitCode: 0 },
  ]);
  assert.equal(bounded.stdout.length, MAX_STDOUT_CHARS);
});

test("script runner declares all resource limits, argv execution, and finally cleanup", async () => {
  assert.deepEqual(DEFAULT_JOB_LIMITS, {
    cpuMillis: 1_000,
    memoryBytes: 268_435_456,
    diskBytes: 268_435_456,
    maxProcesses: 16,
  });
  const source = await readFile(new URL("../src/untrusted-script-runner.ts", import.meta.url), "utf8");
  assert.match(source, /argv: \[/);
  assert.match(source, /timeoutMs/);
  assert.match(source, /finally \{/);
  assert.match(source, /terminateSandbox/);
  assert.doesNotMatch(source, /sh\s+-c|agents|promotions|npm install|curl|git clone/);
});
