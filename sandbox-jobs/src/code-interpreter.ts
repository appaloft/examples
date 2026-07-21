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

export const ANALYZE_CSV_PYTHON = String.raw`import csv
import html
import json
import sys
from collections import defaultdict
from decimal import Decimal
from pathlib import Path

input_path, output_dir = map(Path, sys.argv[1:3])
output_dir.mkdir(parents=True, exist_ok=True)

rows = []
revenue_by_region = defaultdict(Decimal)
with input_path.open(newline="", encoding="utf-8") as source:
    for row in csv.DictReader(source):
        quantity = int(row["quantity"])
        revenue = Decimal(row["unit_price"]) * quantity
        rows.append({**row, "quantity": quantity, "revenue": revenue})
        revenue_by_region[row["region"]] += revenue

total_revenue = sum((row["revenue"] for row in rows), Decimal("0"))
summary = {
    "rowCount": len(rows),
    "totalQuantity": sum(row["quantity"] for row in rows),
    "totalRevenue": f"{total_revenue:.2f}",
    "revenueByRegion": {
        region: f"{value:.2f}" for region, value in sorted(revenue_by_region.items())
    },
}
(output_dir / "summary.json").write_text(
    json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8"
)

with (output_dir / "anomalies.csv").open("w", newline="", encoding="utf-8") as target:
    writer = csv.DictWriter(target, fieldnames=["order_id", "reason", "quantity"])
    writer.writeheader()
    for row in rows:
        if row["quantity"] >= 10:
            writer.writerow({
                "order_id": row["order_id"],
                "reason": "bulk_quantity",
                "quantity": row["quantity"],
            })

chart_width = 640
chart_height = 300
max_value = max(revenue_by_region.values(), default=Decimal("1"))
bars = []
for index, (region, value) in enumerate(sorted(revenue_by_region.items())):
    x = 80 + index * 130
    height = int((value / max_value) * 190)
    y = 240 - height
    bars.append(
        f'<rect x="{x}" y="{y}" width="72" height="{height}" fill="#6d5efc" />'
        f'<text x="{x + 36}" y="265" text-anchor="middle">{html.escape(region)}</text>'
        f'<text x="{x + 36}" y="{max(20, y - 8)}" text-anchor="middle">{value:.2f}</text>'
    )
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{chart_width}" height="{chart_height}" '
    f'viewBox="0 0 {chart_width} {chart_height}">'
    '<rect width="100%" height="100%" fill="white" />'
    '<text x="20" y="28" font-family="sans-serif" font-size="18">Revenue by region</text>'
    '<g font-family="sans-serif" font-size="12" fill="#222">'
    + "".join(bars)
    + "</g></svg>\n"
)
(output_dir / "chart.svg").write_text(svg, encoding="utf-8")
print(json.dumps({"status": "ok", "outputs": ["summary.json", "anomalies.csv", "chart.svg"]}))
`;

export interface CodeInterpreterResult {
  summary: Record<string, unknown>;
  anomaliesCsv: string;
  chartSvg: string;
}

export async function runCodeInterpreter(): Promise<CodeInterpreterResult> {
  const appaloft = createClient();
  const fixture = await readFile(new URL("../fixtures/sales.csv", import.meta.url), "utf8");
  let sandbox: Awaited<ReturnType<typeof createSandbox>> | undefined;

  try {
    sandbox = await createSandbox(
      appaloft,
      requiredEnv("APPALOFT_PYTHON_SANDBOX_TEMPLATE_ID"),
    );
    await writeWorkspaceText(sandbox, "job/sales.csv", fixture);
    await writeWorkspaceText(sandbox, "job/analyze.py", ANALYZE_CSV_PYTHON);

    const outcome = await execute(sandbox, {
      argv: ["python3", "/workspace/job/analyze.py", "/workspace/job/sales.csv", "/workspace/job/out"],
      cwd: "job",
      timeoutMs: 10_000,
    });
    assertSucceeded(outcome);

    const [summaryText, anomaliesCsv, chartSvg] = await Promise.all([
      readWorkspaceText(sandbox, "job/out/summary.json"),
      readWorkspaceText(sandbox, "job/out/anomalies.csv"),
      readWorkspaceText(sandbox, "job/out/chart.svg"),
    ]);
    return { summary: JSON.parse(summaryText), anomaliesCsv, chartSvg };
  } finally {
    if (sandbox) await terminateSandbox(sandbox);
  }
}

if (isMain(import.meta.url)) {
  runCodeInterpreter()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : "Sandbox job failed");
      process.exitCode = 1;
    });
}
