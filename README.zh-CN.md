# Appaloft Examples

Appaloft 官方公开示例 monorepo，用于学习与 smoke 验收。

公开仓库：**https://github.com/appaloft/examples**

Cloud 私仓维护镜像：`appaloft-cloud/examples/`。

## 目录

| 目录 | 用途 | 部署方式 |
| --- | --- | --- |
| [`hello/`](./hello/) | 最小 Node HTTP + Dockerfile + `/health` | `git-public`，`baseDirectory=/hello` |
| [`oneclick/`](./oneclick/) | One-click Blueprint（Dockerfile runtime） | 远程 Blueprint URL（`/oneclick`） |
| [`static/`](./static/) | 静态站上传（无构建） | 上传 `/static` 目录或 ZIP |

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

## License

MIT
