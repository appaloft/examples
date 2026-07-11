# Appaloft Examples

Official public examples for learning and smoke-testing Appaloft.

Canonical repository: **https://github.com/appaloft/examples**

Cloud monorepo mirror (private maintenance): `appaloft-cloud/examples/`.

## Catalog

| Directory | Purpose | Deploy path |
| --- | --- | --- |
| [`hello/`](./hello/) | Minimal Node HTTP app with Dockerfile + `/health` | `git-public` base directory `/hello` |
| [`oneclick/`](./oneclick/) | One-click Blueprint (Dockerfile runtime) | remote Blueprint URL under `/oneclick` |
| [`static/`](./static/) | Static site upload (no build) | ZIP/folder upload of `/static` |

## Deploy hello (git-public)

```bash
appaloft resource create \
  --name example-hello \
  --source-kind git-public \
  --git-url https://github.com/appaloft/examples.git \
  --git-ref main \
  --base-directory /hello \
  --port 3000 \
  --health-path /health
```

Or Cloud Console → Quick Deploy → public Git → this repo → base directory **`hello`**.

## One-click Blueprint

[![Deploy on Appaloft](https://appaloft.com/badge/deploy.svg)](https://app.appaloft.com/deploy?source=blueprint&blueprintUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fappaloft%2Fexamples%2Fmain%2Foneclick%2Fappaloft.blueprint.yaml&blueprintTitle=Oneclick&blueprintProfile=production&step=project&projectMode=new&projectName=Oneclick)

Manifest:

```text
https://raw.githubusercontent.com/appaloft/examples/main/oneclick/appaloft.blueprint.yaml
```

## Growth CTAs

| Content | Destination |
| --- | --- |
| `examples_repo_hero` | [www.appaloft.com](https://www.appaloft.com/?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=examples_repo_hero) |
| `example_hello_console` | [Cloud Console](https://app.appaloft.com/?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_console) |
| `example_static_cta` | [Static-site guide](https://www.appaloft.com/deploy/static-site?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_static_cta) |

## Design rules

1. Each example is a **self-contained deploy unit** under its own directory.
2. No Cloud commercial secrets or private package names.
3. Prefer small images and zero private dependencies for smoke hosts.
4. Keep official launch smoke on **`hello`** (`baseDirectory=/hello`).

## License

MIT — see root [LICENSE](./LICENSE) and per-example notes.
