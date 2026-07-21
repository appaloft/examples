import { appaloft, optionalEnv, requiredEnv, unwrap } from "./client.js";

type SourceArtifact = { artifactId: string; digest: string; status: string };
type CandidatePreview = {
  previewId: string;
  artifactDigest: string;
  status: string;
  url?: string;
  verified: boolean;
};
type Promotion = {
  promotionId: string;
  artifactDigest: string;
  status: string;
  resourceId?: string;
  deploymentId?: string;
  proofVerdict?: "verified" | "failed" | "pending" | null;
};

const sandboxId = requiredEnv("APPALOFT_SANDBOX_ID");
const artifact = unwrap<SourceArtifact>(
  await appaloft.sandboxes.sourceArtifacts.create<SourceArtifact>({
    sandboxId,
    sourceRoot: optionalEnv("APPALOFT_SOURCE_ROOT") ?? "app",
  }),
);
const preview = unwrap<CandidatePreview>(
  await appaloft.sandboxes.candidatePreviews.create<CandidatePreview>({
    artifactId: artifact.artifactId,
  }),
);

if (!preview.verified || preview.artifactDigest !== artifact.digest) {
  throw new Error("Candidate Preview does not verify the captured Source Artifact digest");
}

const plan = unwrap<Promotion>(
  await appaloft.sandboxes.promotions.plan<Promotion>({
    sandboxId,
    artifactId: artifact.artifactId,
    expectedArtifactDigest: artifact.digest,
    candidatePreviewId: preview.previewId,
    target: {
      projectId: requiredEnv("APPALOFT_PROJECT_ID"),
      environmentId: requiredEnv("APPALOFT_ENVIRONMENT_ID"),
      resourceName: optionalEnv("APPALOFT_RESOURCE_NAME") ?? "Generated app",
    },
  }),
);

console.log(JSON.stringify({ artifact, preview, plan }, null, 2));

if (process.env.APPALOFT_ACCEPT_PROMOTION !== "true") {
  console.log(
    "Promotion was planned but not accepted. Review the exact digest and preview, then set APPALOFT_ACCEPT_PROMOTION=true.",
  );
  process.exit(0);
}

const accepted = unwrap<Promotion>(
  await appaloft.sandboxes.promotions.accept<Promotion>({
    promotionId: plan.promotionId,
    expectedArtifactDigest: artifact.digest,
    idempotencyKey: crypto.randomUUID(),
  }),
);

console.log(JSON.stringify({ accepted }, null, 2));
console.log(
  `Poll appaloft.sandboxes.promotions.show({ promotionId: "${plan.promotionId}" }) until delivery proof is terminal.`,
);
