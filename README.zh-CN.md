# Appaloft Examples

Appaloft 官方公开示例 monorepo，用于学习与 smoke 验收。

公开仓库：**https://github.com/appaloft/examples**

Cloud 私仓维护镜像：`appaloft-cloud/examples/`。

## 目录

| 目录 | 用途 | 部署方式 |
| --- | --- | --- |
| [`hello/`](./hello/) | 最小 Node HTTP + Dockerfile + `/health` | `git-public`，`baseDirectory=/hello`，**官方 launch smoke 默认** |
| [`oneclick/`](./oneclick/) | One-click Blueprint（Dockerfile runtime） | 远程 Blueprint URL（`/oneclick`） |
| [`static/`](./static/) | 静态站上传（无构建） | 上传 `/static` 目录或 ZIP |
| [`vite-static/`](./vite-static/) | Vite 构建 → nginx 静态 | `git-public`，端口 `8080` |
| [`python-http/`](./python-http/) | Python 标准库 HTTP | `git-public`，端口 `8000` |
| [`go-http/`](./go-http/) | Go 标准库 HTTP | `git-public`，端口 `8080` |
| [`env-service/`](./env-service/) | 非密钥环境变量注入演示 | `git-public`，`/api/config` |
| [`compose-stack/`](./compose-stack/) | Docker Compose web + api | `docker-compose`，公开端口 `8080` |

## 部署 hello

仓库：`https://github.com/appaloft/examples.git`  
分支：`main`  
根目录：`/hello`  
端口：`3000`  
健康检查：`/health`

## One-click

```text
https://raw.githubusercontent.com/appaloft/examples/main/oneclick/appaloft.blueprint.yaml
```

## 本地 smoke

```bash
./scripts/smoke-all-local.sh
```

各子目录另有 `scripts/smoke-local.sh`（如有）。Cloud 官方 launch smoke 仍钉在 **`hello`**。

## License

MIT
