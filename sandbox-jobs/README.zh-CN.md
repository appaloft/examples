# Sandbox Jobs

这些示例把 Appaloft Execution Sandbox 当作短生命周期任务 worker：任务结果返回给调用方 SaaS，
不创建 Agent Runtime，也不进入 Promotion。

## 如何选择

| 工作负载 | Sandbox | Agent | Promotion |
| --- | --- | --- | --- |
| 已有脚本执行 | ✓ | — | — |
| 自然语言分析 | ✓ | ✓ | — |
| 文档处理 | ✓ | 可选 | — |
| 生成并发布应用 | ✓ | ✓ | ✓ |
| 公网爬虫 | 等待 egress allowlist | — | — |

已有确定性代码时直接使用 Sandbox；需要模型推理或动态工具选择时才加入 Agent；只有生成物要成为
受管理的应用发布版本时才需要 Promotion。

## 共同调用链路

```text
SaaS 后端
  -> appaloft.sandboxes.create（断网、资源限制、TTL）
  -> sandbox.files.write（fixture 和确定性代码）
  -> sandbox.exec（{ argv: [...] }）
  -> sandbox.files.read（结构化结果文件）
  -> sandbox.terminate（finally）
```

```ts
const sandbox = await appaloft.sandboxes.create({
  // source、隔离级别、资源限制、deny-only 网络策略与 TTL
});
try {
  await sandbox.files.write({ path, contentBase64 });
  const execution = await sandbox.exec({ argv: ["python3", "/workspace/job/analyze.py"] });
  const result = await sandbox.files.read({ path: "job/out/summary.json" });
} finally {
  await sandbox.terminate();
}
```

## 前置条件与环境变量

- 调用端使用 Node.js 20+ 与 Bun。
- Appaloft 1.2+，并已开放 Execution Sandbox API。
- 前两个示例需要预先存在、包含 `python3` 的离线 Python Template。
- 脚本 runner 需要预先存在、包含 `node` 的离线 Node Template。
- Template 必须由 Appaloft operator 预先准备；任务运行期间不会安装依赖。

```bash
cp .env.example .env
export APPALOFT_API_URL="https://your-control-plane.example/api"
export APPALOFT_SESSION_COOKIE="your-product-session-cookie"
export APPALOFT_PYTHON_SANDBOX_TEMPLATE_ID="your-python-template-id"
export APPALOFT_NODE_SANDBOX_TEMPLATE_ID="your-node-template-id"
bun install --frozen-lockfile
```

session cookie 只能保存在 SaaS 后端，不得发给浏览器、写入 workspace 或输出到日志。

## 1. Code interpreter

**用户故事：** 报表 SaaS 收到 CSV，希望运行可复现的分析，而不是把数据和既有代码交给模型。

**调用链路：** 调用方上传 [`fixtures/sales.csv`](./fixtures/sales.csv) 和只使用 Python 标准库的
脚本，以 argv 数组执行 `python3`，在清理前读取全部结果。整个过程不创建 Pi 或 Agent Runtime。

**输入/输出：** 输入是一份 CSV；输出是 `summary.json`、`anomalies.csv` 和不依赖第三方库的
`chart.svg`，调用方返回解码后的文件内容。

**安全边界：** Sandbox 使用 `networkPolicy: { mode: "deny", rules: [] }`、固定 CPU/内存/磁盘/
进程限制、15 分钟 TTL 和 10 秒 exec timeout。CSV 验证仍属于应用自身责任。

```bash
bun run code-interpreter
```

源码：[`src/code-interpreter.ts`](./src/code-interpreter.ts)

## 2. Document processing

**用户故事：** 后台 SaaS 在断网的隔离 worker 中提取并核对一种已知格式的 invoice 文本。

**调用链路：** 调用方写入仓库自带的安全离线 fixture 和确定性 extractor，运行 `python3`，再读取
`invoices.json` 与 `report.md`。

**输入/输出：** 输入是 [`fixtures/invoice-document.txt`](./fixtures/invoice-document.txt)；JSON
返回标准化 invoice 字段和行项目，Markdown 返回核对报告。

**安全边界与 Template 前置条件：** 这不是 PDF/OCR 能力声明。默认示例只解析已知 UTF-8 文本，
不会访问网络。真实 PDF 必须使用预先构建并审查、已包含 PDF 工具的 Sandbox Template；扫描件还需要
预装 OCR 工具和语言数据。API 不会在运行时安装或下载这些工具，也没有调用 OCR SaaS。

```bash
bun run document-processing
```

源码：[`src/document-processing.ts`](./src/document-processing.ts)

## 3. Untrusted script runner

**用户故事：** 自动化 SaaS 接受客户提交的小型 JavaScript transform，返回 stdout、exit code 和
结构化结果。

**调用链路：** 调用方写入用户 module、输入 JSON 和固定 runner，用 argv 数组调用 `node`。成功和
普通脚本失败都会生成 `result.json`。Sandbox timeout 不会产生 process exit frame，因此示例如实返回
`exitCode: null`，并由调用方先写入结构化 timeout 结果再读取。

**输入/输出：** 输入是 [`fixtures/transform-input.json`](./fixtures/transform-input.json) 和示例
module；输出包含 `status`、受限 stdout、`exitCode` 以及解析后的 `result.json`。

**安全边界：** CPU 限制为 1 core、内存与磁盘各 256 MiB、最多 16 个进程、默认断网，exec timeout
为 3 秒；命令不会拼成 shell 字符串。`container-trusted` 只适用于可信或单租户任务，不能宣称它能提供
hostile multi-tenant security。对抗性租户应使用 operator 支持的 gVisor/Kata/microVM 等更强隔离并
配合纵深防御。本示例请求 gVisor，实际可用性取决于 operator 和 Template。

```bash
bun run untrusted-script-runner
```

源码：[`src/untrusted-script-runner.ts`](./src/untrusted-script-runner.ts)

## Cleanup 与当前限制

三个入口都在 `finally` 中 terminate Sandbox；创建成功后的 API 错误、脚本失败和 timeout 也会清理。
15 分钟 TTL 是第二道保护，不替代主动 cleanup。

Appaloft 当前还没有面向这类任务的通用 Result Artifact。必须在 `sandbox.terminate()` 或 TTL 到期前
读取所需 workspace 文件；终止后临时 workspace 会被删除。小型 stdout 可直接返回，结构化结果必须
先写入 workspace，再通过文件 API 读取。

所有示例默认 deny-only 网络策略，不实现或宣称公网 crawler、Browser QA 或 npm dependency upgrade；
这些链路要等待完整 egress allowlist 和对应的已审查 Template。

## 测试

测试会在本机断网执行同一份确定性 Python/Node 脚本，并验证 SDK 生命周期契约、失败和 timeout 归一化。

```bash
bun run typecheck
bun run test
```
