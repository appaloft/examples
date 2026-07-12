# Go HTTP

最小 **Go**（仅标准库）HTTP 服务，用于多语言 **git-public** 部署。

默认端口 **8080**（非 3000），用于验证自定义 port/health。

| 项 | 值 |
| --- | --- |
| base directory | `/go-http` |
| 端口 | `8080` |
| 健康检查 | `/health` |

```bash
PORT=8080 go run .
./scripts/smoke-local.sh
```

## License

MIT
