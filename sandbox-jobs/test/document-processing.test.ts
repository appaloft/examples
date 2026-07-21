import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { EXTRACT_INVOICE_PYTHON } from "../src/document-processing.js";

test("document processor extracts and reconciles the offline fixture", async () => {
  const directory = await mkdtemp(join(tmpdir(), "appaloft-document-processing-"));
  try {
    const scriptPath = join(directory, "extract.py");
    const inputPath = join(directory, "invoice-document.txt");
    const outputPath = join(directory, "out");
    const fixture = await readFile(
      new URL("../fixtures/invoice-document.txt", import.meta.url),
      "utf8",
    );
    await Promise.all([
      writeFile(scriptPath, EXTRACT_INVOICE_PYTHON, "utf8"),
      writeFile(inputPath, fixture, "utf8"),
    ]);

    const run = spawnSync("python3", [scriptPath, inputPath, outputPath], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    const invoices = JSON.parse(await readFile(join(outputPath, "invoices.json"), "utf8"));
    assert.equal(invoices[0].invoiceNumber, "INV-2026-0042");
    assert.equal(invoices[0].subtotal, "95.00");
    assert.equal(invoices[0].total, "104.50");
    assert.match(await readFile(join(outputPath, "report.md"), "utf8"), /Reconciliation: passed/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("document processor stays offline and always terminates its Sandbox", async () => {
  const source = await readFile(new URL("../src/document-processing.ts", import.meta.url), "utf8");
  assert.match(source, /networkPolicy|createSandbox/);
  assert.match(source, /finally \{/);
  assert.match(source, /terminateSandbox/);
  assert.doesNotMatch(source, /https?:\/\/|OCR|npm install|pip install|curl|agents|promotions/);
});
