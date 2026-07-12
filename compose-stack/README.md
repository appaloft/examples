# Compose Stack

Minimal **Docker Compose** multi-service example: public `web` + private `api` sidecar.

Public Appaloft supports `runtime.strategy: docker-compose` (see Community docs / config file reference).

Part of: **https://github.com/appaloft/examples**

## Services

| Service | Role | Network |
| --- | --- | --- |
| `web` | Public HTTP edge (port **8080**) | published |
| `api` | Private JSON API (port **3000**) | compose network only |

`web` proxies `/api/hello` → `http://api:3000/api/hello`.

## Contract

| Field | Value |
| --- | --- |
| Base directory | `/compose-stack` |
| Compose file | `docker-compose.yml` |
| Public port | `8080` (`web`) |
| Health | `/health` on `web` |

## Local

```bash
docker compose up --build
curl -sS http://127.0.0.1:8080/health
curl -sS http://127.0.0.1:8080/api/hello
./scripts/smoke-local.sh
```

## Deploy

CLI (compose method):

```bash
appaloft deploy . --method docker-compose
# or git-public source with baseDirectory=/compose-stack and compose strategy
```

Documented config in this directory:

```yaml
runtime:
  strategy: docker-compose
  dockerComposeFilePath: docker-compose.yml
network:
  internalPort: 8080
health:
  path: /health
```

Cloud Console: deploy this monorepo path with compose/runtime strategy when the surface is enabled; otherwise use pure-SSH / Community CLI compose deploy against this directory.

## License

MIT
