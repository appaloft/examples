# Vite Static

**带构建**的静态站示例（Vite → `dist/`）。

与 [`static/`](../static/)（无构建、直接上传）不同：本目录有真实前端构建，多阶段 Dockerfile 在 **8080** 端口提供产物。

公开 monorepo：**https://github.com/appaloft/examples**

## 部署契约

| 项 | 值 |
| --- | --- |
| base directory | `/vite-static` |
| 端口 | `8080` |
| 健康检查 | `/health` |

## 本地

```bash
npm install && npm run build
./scripts/smoke-local.sh
```

## License

MIT
