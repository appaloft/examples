# Go HTTP

Minimal **Go** (stdlib only) HTTP service for multi-language **git-public** deploys.

Listens on **port 8080** (not 3000) so you can verify custom port/health configuration.

Part of: **https://github.com/appaloft/examples**

## Contract

| Field | Value |
| --- | --- |
| Base directory | `/go-http` |
| Port | `8080` |
| Health | `/health` |
| Runtime | Dockerfile (multi-stage static binary) |

## Local

```bash
PORT=8080 go run .
curl -sS http://127.0.0.1:8080/health
./scripts/smoke-local.sh
```

```bash
docker build -t appaloft-example-go-http .
docker run --rm -p 8080:8080 appaloft-example-go-http
```

## Deploy (git-public)

```bash
appaloft resource create \
  --name example-go-http \
  --source-kind git-public \
  --git-url https://github.com/appaloft/examples.git \
  --git-ref main \
  --base-directory /go-http \
  --port 8080 \
  --health-path /health
```

## License

MIT
