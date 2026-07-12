# Python HTTP

Minimal **Python** (stdlib only) HTTP service for multi-language **git-public** deploys.

Listens on **port 8000** (not 3000) so you can verify non-default port/health configuration.

Part of: **https://github.com/appaloft/examples**

## Contract

| Field | Value |
| --- | --- |
| Base directory | `/python-http` |
| Port | `8000` |
| Health | `/health` |
| Runtime | Dockerfile (`python:3.12-alpine`) |

## Local

```bash
PORT=8000 python3 server.py
curl -sS http://127.0.0.1:8000/health
./scripts/smoke-local.sh
```

```bash
docker build -t appaloft-example-python-http .
docker run --rm -p 8000:8000 appaloft-example-python-http
```

## Deploy (git-public)

```bash
appaloft resource create \
  --name example-python-http \
  --source-kind git-public \
  --git-url https://github.com/appaloft/examples.git \
  --git-ref main \
  --base-directory /python-http \
  --port 8000 \
  --health-path /health
```

## License

MIT
