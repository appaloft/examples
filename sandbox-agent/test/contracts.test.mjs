import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (name) => readFile(new URL(`../src/${name}`, import.meta.url), "utf8");

test("chat-to-app nests Runtime and Run under a Sandbox", async () => {
  const content = await source("chat-to-app.ts");
  assert.match(content, /appaloft\.sandboxes\.create/);
  assert.match(content, /sandbox\.agents\.create\(\{ harness: "pi" \}\)/);
  assert.match(content, /agent\.runs\.create\(\{ task:/);
  assert.match(content, /networkPolicy: \{ mode: "deny", rules: \[\] \}/);
  assert.match(content, /expiresAt:/);
});

test("approval-loop cannot approve without an explicit human decision", async () => {
  const content = await source("approval-loop.ts");
  assert.match(content, /APPALOFT_APPROVAL_DECISION/);
  assert.match(content, /decision !== "approve" && decision !== "reject"/);
  assert.match(content, /approvals\.resolve/);
});

test("preview-promote verifies the digest and gates acceptance", async () => {
  const content = await source("preview-promote.ts");
  assert.match(content, /preview\.artifactDigest !== artifact\.digest/);
  assert.match(content, /APPALOFT_ACCEPT_PROMOTION !== "true"/);
  assert.match(content, /expectedArtifactDigest: artifact\.digest/);
  assert.match(content, /promotions\.accept/);
});
