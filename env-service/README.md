# Env Service

Minimal Node HTTP service that **reads non-secret environment variables** and exposes them at `/api/config`.

Use this to verify env injection from Appaloft config / console — **do not put real secrets** in the repo or in `/api/config`.

Part of: **https://github.com/appaloft/examples**

## Contract

| Field | Value |
| --- | --- |
| Base directory | `/env-service` |
| Port | `3000` |
| Health | `/health` |
| Config JSON | `/api/config` |

Demo env keys (safe defaults in `appaloft.yml` / Dockerfile):

| Key | Purpose |
| --- | --- |
| `APP_NAME` | Display name |
| `GREETING` | Home page greeting |
| `FEATURE_FLAG` | Simple feature toggle string |

## Local

```bash
APP_NAME=my-app GREETING="Hi" FEATURE_FLAG=on node server.js
curl -sS http://127.0.0.1:3000/api/config
./scripts/smoke-local.sh
```

```bash
docker build -t appaloft-example-env-service .
docker run --rm -p 3000:3000 \
  -e APP_NAME=from-docker \
  -e GREETING="injected" \
  -e FEATURE_FLAG=on \
  appaloft-example-env-service
```

## Deploy (git-public)

```bash
appaloft resource create \
  --name example-env-service \
  --source-kind git-public \
  --git-url https://github.com/appaloft/examples.git \
  --git-ref main \
  --base-directory /env-service \
  --port 3000 \
  --health-path /health
```

Then set non-secret env vars on the resource (or rely on `appaloft.yml` `env:` defaults).

## License

MIT
