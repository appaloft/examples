# Compose Stack

最小 **Docker Compose** 多服务示例：公开 `web` + 私有 `api` sidecar。

Appaloft 支持 `runtime.strategy: docker-compose`。

| 服务 | 角色 | 网络 |
| --- | --- | --- |
| `web` | 公开 HTTP（**8080**） | 对外发布 |
| `api` | 私有 JSON API（**3000**） | 仅 compose 网络 |

| 项 | 值 |
| --- | --- |
| base directory | `/compose-stack` |
| 公开端口 | `8080` |
| 健康检查 | `/health`（web） |

```bash
docker compose up --build
./scripts/smoke-local.sh
```

## License

MIT
