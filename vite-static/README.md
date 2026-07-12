# Vite Static

**Built** static site example (Vite → `dist/`) for Appaloft.

Unlike [`static/`](../static/) (upload-only, no build), this directory has a real frontend build and a multi-stage Dockerfile that serves the result on **port 8080**.

Part of: **https://github.com/appaloft/examples**

## Contract

| Field | Value |
| --- | --- |
| Base directory | `/vite-static` |
| Port | `8080` |
| Health | `/health` |
| Runtime | Dockerfile (node build → nginx) |

## Local

```bash
npm install
npm run build
npm run preview
# or
./scripts/smoke-local.sh
```

```bash
docker build -t appaloft-example-vite-static .
docker run --rm -p 8080:8080 appaloft-example-vite-static
curl -sS http://127.0.0.1:8080/health
```

## Deploy (git-public)

```bash
appaloft resource create \
  --name example-vite-static \
  --source-kind git-public \
  --git-url https://github.com/appaloft/examples.git \
  --git-ref main \
  --base-directory /vite-static \
  --port 8080 \
  --health-path /health
```

Console: Quick Deploy → public Git → `appaloft/examples` → base directory **`vite-static`** → port **8080**.

## License

MIT
