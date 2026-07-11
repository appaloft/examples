# Hello

最小、无依赖的 Node HTTP 示例，用于学习与验收 **Appaloft 源码部署**。

统一示例 monorepo：**https://github.com/appaloft/examples**

用途：

1. **公开 git-public** 部署（`baseDirectory=/hello`，不需要 GitHub App）
2. **Dockerfile + 健康检查 + 端口** 参考布局
3. 未来 **GitHub App 安装 → 选仓 → 设 base directory → 部署** 的公开示例源

```bash
git clone https://github.com/appaloft/examples.git
cd examples/hello
```

**用 Appaloft Cloud 部署**（增长漏斗可追踪 CTA）：

- [打开 Appaloft 官网](https://www.appaloft.com/?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_cta)
- [打开 Cloud Console](https://app.appaloft.com/?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_console)
- 静态站？见 [`static/`](../static/) 或 [静态站说明](https://www.appaloft.com/deploy/static-site?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_static_cta)

## 本地运行

```bash
node server.js
curl -sS http://127.0.0.1:3000/health
```

## 部署要点

| 项 | 值 |
| --- | --- |
| 源类型 | `git-public` 或 GitHub App 选仓 |
| 仓库 | `https://github.com/appaloft/examples.git` |
| 分支 | `main` |
| 根目录 | `/hello` |
| 端口 | `3000` |
| 健康检查 | `/health` |

Cloud Console：打开 [Console](https://app.appaloft.com/?utm_source=github&utm_medium=readme&utm_campaign=growth_funnel_2026w28&utm_content=example_hello_console) → Quick Deploy → 公开 Git → 本 monorepo，base directory 填 **`hello`** → 部署。

## 设计约定

- 单一公开 HTTP 端口  
- `/health` 无需鉴权返回 200  
- Dockerfile 无密钥  
- 首部部署无私有依赖  

## License

MIT
