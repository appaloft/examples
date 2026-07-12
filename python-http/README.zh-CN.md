# Python HTTP

最小 **Python**（仅标准库）HTTP 服务，用于多语言 **git-public** 部署。

默认端口 **8000**（非 3000），用于验证自定义 port/health。

| 项 | 值 |
| --- | --- |
| base directory | `/python-http` |
| 端口 | `8000` |
| 健康检查 | `/health` |

```bash
PORT=8000 python3 server.py
./scripts/smoke-local.sh
```

## License

MIT
