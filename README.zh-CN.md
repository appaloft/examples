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
| [`sandbox-agent/`](./sandbox-agent/) | Chat-to-App、人工审批和 Preview-to-Promotion SDK 链路 | Appaloft 1.2+，**Private preview** |
| [`sandbox-jobs/`](./sandbox-jobs/) | 无 Promotion 的确定性代码、离线文档与受限脚本任务 | Appaloft 1.2+，**Private preview** |

## Sandbox Jobs

当 SaaS 需要的是隔离任务结果、而不是发布应用时，使用 [`sandbox-jobs/`](./sandbox-jobs/)。这些示例
写入输入、在不使用 Pi 的情况下执行既有代码、读取结构化结果，并在 `finally` 中终止 Sandbox。

| 工作负载 | Sandbox | Agent | Promotion |
| --- | --- | --- | --- |
| 已有脚本执行 | ✓ | — | — |
| 自然语言分析 | ✓ | ✓ | — |
| 文档处理 | ✓ | 可选 | — |
| 生成并发布应用 | ✓ | ✓ | ✓ |
| 公网爬虫 | 等待 egress allowlist | — | — |

从 [Sandbox Jobs 指南](./sandbox-jobs/README.zh-CN.md)开始，也可以直接查看
[code interpreter](./sandbox-jobs/src/code-interpreter.ts)、
[document processor](./sandbox-jobs/src/document-processing.ts) 和
[script runner](./sandbox-jobs/src/untrusted-script-runner.ts)。

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
