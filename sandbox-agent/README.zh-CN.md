# Sandbox Agent SDK 示例

这些示例面向把代码 Agent 嵌入自己产品的开发者。你的应用保留 chat、用户身份和产品策略；Appaloft
负责隔离 Sandbox、Pi Runtime、可观察 Run、不可变候选产物、Promotion 与交付 readback。Agent
拿到的是受控工作区，不是 VPS 账户或生产凭据。

> 成熟度：**Private preview**。示例需要 Appaloft 1.2+ control plane、匹配的
> `@appaloft/sdk`、运营方配置的 Sandbox worker，以及固定版本和 digest 的 Pi template。当前 Agent
> operation 使用 product session；这里不暗示已经存在长期 server credential。

## 用户故事

| 示例 | 产品故事 | 安全边界 |
| --- | --- | --- |
| [`chat-to-app.ts`](./src/chat-to-app.ts) | 用户让你的 SaaS 生成或修改应用。 | 创建一小时过期、默认断网的 Sandbox；Runtime 和 Run 从属于它，chat 仍由你的 SaaS 持有。 |
| [`approval-loop.ts`](./src/approval-loop.ts) | Run 请求需要人工决定的能力。 | 只展示结构化元数据；没有显式 `approve` 或 `reject` 就不执行 resolve。 |
| [`preview-promote.ts`](./src/preview-promote.ts) | 生成结果已经可以预览并准备上线。 | Preview 校验不可变 digest；先 plan，只有外部控制面明确接受后才 Promotion。 |

## 配置与运行

```bash
cd sandbox-agent
npm install
cp .env.example .env

npm run chat-to-app
npm run approval-loop
npm run preview-promote
```

使用你习惯的工具加载 `.env`，或在 shell 中 export。不要提交 session cookie。Pi Sandbox template
由运营方维护并固定版本/digest，这些示例不会自行创建它。

`preview-promote` 默认停在 plan。检查输出的 preview URL 与精确 digest 后，再显式设置
`APPALOFT_ACCEPT_PROMOTION=true`，才会创建正式 Resource 和第一次 Deployment。

```bash
npm run check
```

Delivery Proof 证明的是观测到的交付状态，不保证应用正确性、安全性或合规性。
