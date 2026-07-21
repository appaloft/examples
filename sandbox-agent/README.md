# Sandbox Agent SDK examples

These examples show how a product developer embeds a coding agent without handing a VPS or
production credentials to the agent. The application owns chat, user identity, and product policy;
Appaloft owns the isolated Sandbox, Pi Runtime, observable Runs, immutable candidate, Promotion,
and delivery readback.

> Maturity: **Private preview**. These examples require an Appaloft 1.2+ control plane, a matching
> `@appaloft/sdk`, an operator-provisioned Sandbox worker, and a pinned Pi template. Agent
> operations currently use a product session; a long-lived server credential is not implied.

## User stories

| Example | Product story | Safety boundary |
| --- | --- | --- |
| [`chat-to-app.ts`](./src/chat-to-app.ts) | A user asks your SaaS to build or modify an app. | A one-hour, deny-by-default Sandbox owns Runtime and Run. Your SaaS keeps the chat. |
| [`approval-loop.ts`](./src/approval-loop.ts) | A Run requests a capability that needs a human decision. | The script inspects structured metadata and does nothing until `approve` or `reject` is explicit. |
| [`preview-promote.ts`](./src/preview-promote.ts) | Generated output is ready for review and release. | Preview verifies an immutable digest; Promotion is planned first and accepted only through an external gate. |

## Setup

```bash
cd sandbox-agent
npm install
cp .env.example .env
```

Load `.env` with your preferred environment tool, or export the values in your shell. Never commit
the session cookie. The Pi Sandbox template is an operator-owned, version- and digest-pinned image;
it is not created by these examples.

## Run

```bash
npm run chat-to-app
npm run approval-loop
npm run preview-promote
```

`preview-promote` stops after the plan by default. Inspect the printed preview URL and exact digest,
then deliberately set `APPALOFT_ACCEPT_PROMOTION=true` to create the production Resource and first
Deployment. Read the Promotion until it includes terminal deployment proof.

Run the source contract tests and typecheck with:

```bash
npm run check
```

## What this is not

- It is not a general VPS account for the agent.
- It is not a chat framework or model provider.
- A delivery proof verifies observed delivery state, not application correctness, security, or compliance.
