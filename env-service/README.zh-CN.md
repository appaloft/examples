# Env Service

最小 Node HTTP 服务：读取**非密钥**环境变量，并在 `/api/config` 展示。

用于验收 Appaloft 环境变量注入。**不要**把真实密钥写进仓库或暴露到 `/api/config`。

| 项 | 值 |
| --- | --- |
| base directory | `/env-service` |
| 端口 | `3000` |
| 健康检查 | `/health` |
| 配置 JSON | `/api/config` |

演示变量：`APP_NAME`、`GREETING`、`FEATURE_FLAG`。

```bash
APP_NAME=my-app GREETING="Hi" FEATURE_FLAG=on node server.js
./scripts/smoke-local.sh
```

## License

MIT
