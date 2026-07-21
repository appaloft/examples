import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { ANALYZE_CSV_PYTHON } from "../src/code-interpreter.js";

test("code interpreter produces deterministic JSON, CSV, and dependency-free SVG", async () => {
  const directory = await mkdtemp(join(tmpdir(), "appaloft-code-interpreter-"));
  try {
    const scriptPath = join(directory, "analyze.py");
    const inputPath = join(directory, "sales.csv");
    const outputPath = join(directory, "out");
    const fixture = await readFile(new URL("../fixtures/sales.csv", import.meta.url), "utf8");
    await Promise.all([
      writeFile(scriptPath, ANALYZE_CSV_PYTHON, "utf8"),
      writeFile(inputPath, fixture, "utf8"),
    ]);

    const run = spawnSync("python3", [scriptPath, inputPath, outputPath], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    const summary = JSON.parse(await readFile(join(outputPath, "summary.json"), "utf8"));
    assert.deepEqual(summary, {
      revenueByRegion: { East: "880.00", North: "102.50", South: "127.00", West: "97.50" },
      rowCount: 6,
      totalQuantity: 33,
      totalRevenue: "1207.00",
    });
    assert.match(await readFile(join(outputPath, "anomalies.csv"), "utf8"), /1006,bulk_quantity,20/);
    const chart = await readFile(join(outputPath, "chart.svg"), "utf8");
    assert.match(chart, /^<svg xmlns=/);
    assert.doesNotMatch(ANALYZE_CSV_PYTHON, /matplotlib|pandas|pip install/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("code interpreter uses file APIs, argv exec, and finally cleanup without Agent Runtime", async () => {
  const [source, lifecycle] = await Promise.all([
    readFile(new URL("../src/code-interpreter.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/shared/sandbox-lifecycle.ts", import.meta.url), "utf8"),
  ]);
  assert.match(source, /writeWorkspaceText/);
  assert.match(source, /argv: \["python3"/);
  assert.match(source, /readWorkspaceText/);
  assert.match(source, /finally \{/);
  assert.match(source, /terminateSandbox/);
  assert.doesNotMatch(source, /agents|promotions|npm install|curl|git clone/);
  assert.match(lifecycle, /client\.sandboxes\.create/);
  assert.match(lifecycle, /sandbox\.files\.write/);
  assert.match(lifecycle, /sandbox\.files\.read/);
  assert.match(lifecycle, /sandbox\.exec/);
  assert.match(lifecycle, /sandbox\.terminate/);
  assert.doesNotMatch(lifecycle, /sandboxFiles|sandboxes\.exec|sandboxes\.terminate/);
});
