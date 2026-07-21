import { readFile } from "node:fs/promises";
import { createClient, requiredEnv } from "./shared/appaloft-client.js";
import {
  assertSucceeded,
  createSandbox,
  execute,
  isMain,
  readWorkspaceText,
  terminateSandbox,
  writeWorkspaceText,
} from "./shared/sandbox-lifecycle.js";

export const EXTRACT_INVOICE_PYTHON = String.raw`import json
import sys
from decimal import Decimal
from pathlib import Path

input_path, output_dir = map(Path, sys.argv[1:3])
output_dir.mkdir(parents=True, exist_ok=True)
lines = [line.strip() for line in input_path.read_text(encoding="utf-8").splitlines()]

def field(prefix):
    for line in lines:
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    raise ValueError(f"missing field: {prefix}")

items_start = lines.index("Items:") + 1
items = []
for line in lines[items_start:]:
    if not line:
        continue
    if line.startswith("Tax:"):
        break
    description, quantity, unit_price = [part.strip() for part in line.split("|")]
    amount = Decimal(unit_price) * int(quantity)
    items.append({
        "description": description,
        "quantity": int(quantity),
        "unitPrice": f"{Decimal(unit_price):.2f}",
        "amount": f"{amount:.2f}",
    })

subtotal = sum((Decimal(item["amount"]) for item in items), Decimal("0"))
tax = Decimal(field("Tax:"))
total = Decimal(field("Total:"))
if subtotal + tax != total:
    raise ValueError("invoice total does not reconcile")

invoice = {
    "invoiceNumber": field("Invoice:"),
    "invoiceDate": field("Invoice Date:"),
    "dueDate": field("Due Date:"),
    "currency": field("Currency:"),
    "customer": field("Customer:"),
    "items": items,
    "subtotal": f"{subtotal:.2f}",
    "tax": f"{tax:.2f}",
    "total": f"{total:.2f}",
}
(output_dir / "invoices.json").write_text(
    json.dumps([invoice], indent=2, sort_keys=True) + "\n", encoding="utf-8"
)
report = f"""# Invoice processing report

- Documents processed: 1
- Invoice: {invoice['invoiceNumber']}
- Customer: {invoice['customer']}
- Total: {invoice['currency']} {invoice['total']}
- Reconciliation: passed
"""
(output_dir / "report.md").write_text(report, encoding="utf-8")
print(json.dumps({"status": "ok", "invoiceCount": 1}))
`;

export interface DocumentProcessingResult {
  invoices: unknown[];
  reportMarkdown: string;
}

export async function runDocumentProcessing(): Promise<DocumentProcessingResult> {
  const appaloft = createClient();
  const fixture = await readFile(
    new URL("../fixtures/invoice-document.txt", import.meta.url),
    "utf8",
  );
  let sandbox: Awaited<ReturnType<typeof createSandbox>> | undefined;

  try {
    sandbox = await createSandbox(
      appaloft,
      requiredEnv("APPALOFT_PYTHON_SANDBOX_TEMPLATE_ID"),
    );
    await writeWorkspaceText(sandbox, "job/invoice-document.txt", fixture);
    await writeWorkspaceText(sandbox, "job/extract.py", EXTRACT_INVOICE_PYTHON);

    const outcome = await execute(sandbox, {
      argv: [
        "python3",
        "/workspace/job/extract.py",
        "/workspace/job/invoice-document.txt",
        "/workspace/job/out",
      ],
      cwd: "job",
      timeoutMs: 10_000,
    });
    assertSucceeded(outcome);

    const [invoicesText, reportMarkdown] = await Promise.all([
      readWorkspaceText(sandbox, "job/out/invoices.json"),
      readWorkspaceText(sandbox, "job/out/report.md"),
    ]);
    return { invoices: JSON.parse(invoicesText), reportMarkdown };
  } finally {
    if (sandbox) await terminateSandbox(sandbox);
  }
}

if (isMain(import.meta.url)) {
  runDocumentProcessing()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : "Sandbox job failed");
      process.exitCode = 1;
    });
}
