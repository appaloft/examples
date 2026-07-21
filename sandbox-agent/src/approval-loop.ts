import { appaloft, optionalEnv, requiredEnv, unwrap } from "./client.js";

type Approval = {
  approvalId: string;
  runId: string;
  capability: string;
  destination?: string;
  requestDigest: string;
  status: string;
  expiresAt: string;
};

type ApprovalList = { items: Approval[]; total: number };

const runId = requiredEnv("APPALOFT_RUN_ID");
const approvals = unwrap<ApprovalList>(
  await appaloft.sandboxes.agents.approvals.list<ApprovalList>({ runId }),
);
const pending = approvals.items.filter((approval) => approval.status === "pending");

console.log(JSON.stringify({ runId, pending }, null, 2));

const decision = optionalEnv("APPALOFT_APPROVAL_DECISION");
if (!decision) {
  console.log(
    "Inspection only. Set APPALOFT_APPROVAL_DECISION=approve|reject after a human reviews the request.",
  );
  process.exit(0);
}
if (decision !== "approve" && decision !== "reject") {
  throw new Error("APPALOFT_APPROVAL_DECISION must be approve or reject");
}

const requestedApprovalId = optionalEnv("APPALOFT_APPROVAL_ID");
const approval = requestedApprovalId
  ? pending.find((item) => item.approvalId === requestedApprovalId)
  : pending.length === 1
    ? pending[0]
    : undefined;

if (!approval) {
  throw new Error(
    requestedApprovalId
      ? `Pending approval not found: ${requestedApprovalId}`
      : "Set APPALOFT_APPROVAL_ID when the Run has zero or multiple pending approvals",
  );
}

const resolved = unwrap<Approval>(
  await appaloft.sandboxes.agents.approvals.resolve<Approval>({
    approvalId: approval.approvalId,
    decision,
  }),
);

console.log(JSON.stringify({ resolved }, null, 2));
