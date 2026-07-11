# Hello

Minimal, dependency-free Node HTTP app for learning and smoke-testing **Appaloft source deploys**.

Part of the unified examples monorepo: **https://github.com/appaloft/examples**

Use this directory as:

1. A **public git-public** deploy target (no GitHub App required) with `baseDirectory=/hello`
2. A reference layout for **Dockerfile + health + port** contracts
3. A future base for **GitHub App** install → pick repo → set base directory → deploy

```bash
git clone https://github.com/appaloft/examples.git
cd examples/hello
```

**Deploy with Appaloft Cloud** (tracked CTA):

- [Open Appaloft](https://www.appaloft.com/?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_cta)
- [Open Cloud Console](https://app.appaloft.com/?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_console)
- Prefer a static site path? [Static-site guide](https://www.appaloft.com/deploy/static-site?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_static_cta) or the [`static/`](../static/) example

## What you get

| Path | Purpose |
| --- | --- |
| `server.js` | Zero-dependency HTTP server |
| `Dockerfile` | Production container image |
| `appaloft.yml` | Documented Appaloft network/health intent |
| `/health` | Health JSON for probes |
| `/api/hello` | Sample JSON API |
| `/` | Small HTML page |

## Local run

```bash
node server.js
# open http://127.0.0.1:3000/health
```

```bash
docker build -t appaloft-example-hello .
docker run --rm -p 3000:3000 appaloft-example-hello
curl -sS http://127.0.0.1:3000/health
```

## Deploy with Appaloft (public git)

### CLI

```bash
appaloft resource create \
  --name example-hello \
  --source-kind git-public \
  --git-url https://github.com/appaloft/examples.git \
  --git-ref main \
  --base-directory /hello \
  --port 3000 \
  --health-path /health

appaloft deployments create --resource <resourceId>
appaloft deployments events <deploymentId> --follow
```

Contract:

| Field | Value |
| --- | --- |
| Source kind | `git-public` |
| Repository | `https://github.com/appaloft/examples.git` |
| Ref | `main` |
| Base directory | `/hello` |
| Port | `3000` |
| Health | `/health` |

### Cloud Console

1. Open [Appaloft Cloud Console](https://app.appaloft.com/?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_console)
2. Quick Deploy / create application
3. Choose **public Git** (or GitHub App when enabled)
4. Repository `appaloft/examples`, base directory **`hello`**
5. Deploy and open the public URL

## Smoke / CI

Appaloft Cloud launch smoke (`CLOUD-LAUNCH-SMOKE-005`) defaults to:

| Setting | Value |
| --- | --- |
| Repository | `https://github.com/appaloft/examples.git` |
| Ref | `main` |
| Base directory | `/hello` |
| Port | `3000` |
| Health | `/health` |

## Design rules

1. **One public HTTP port** documented and exposed  
2. **Health endpoint** returns 200 without auth  
3. **Dockerfile** builds from this directory without secrets  
4. **No private dependencies** for first deploy  
5. **Small image** so smoke hosts pull quickly  

## License

MIT — see [LICENSE](./LICENSE) and the monorepo root.
