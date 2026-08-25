# 当前实现架构

## 版本边界

这是课程网站和 P0 的第一份可执行切片，开放 75 分钟零基础预备章 P00 与 M00–M02。P00 提供阅读对象、函数和基础类型、诊断、unknown 窄化与类型擦除所需的最低能力；它排在导航首位，但不重编号 M00–M02，也不改变其直接 URL。

## 页面

| 路由 | 职责 |
|---|---|
| `/` | 课程价值、三层心智模型、进度与开放章节 |
| `/lesson/:slug` | 课程正文、代码、Callout、实验和验收 |
| `/roadmap` | 15 章与 P0–P8 路线 |
| `/playground` | P00 三个渐进练习与各模块实验的全屏编辑和运行 |
| `/project` | CodePilot P0 状态、命令、契约和后续扩展点 |

## 浏览器实验

```text
课程 Lab
  → Monaco TypeScript Worker（诊断 + emit）
  → Blob Web Worker（隔离执行）
  → console 捕获 / 运行时异常 / 2 秒超时
```

实验源码和草稿只进入当前浏览器的 `localStorage`。生成的 Worker URL 在完成、错误和超时时都会撤销。

## 本地进度与搜索

- 进度数据使用带 `schemaVersion` 的结构，坏数据安全回退为空状态；
- 同页面组件通过自定义事件同步，跨标签页通过 `storage` 事件同步；
- 每个 Lab 草稿单独保存；
- 搜索索引由强类型课程数据生成，支持中文、概念、代码符号和错误术语；
- `Ctrl/Cmd + K` 或 `/` 打开搜索。

## CodePilot P0

```text
CLI 输入
  → createReviewJob（领域对象）
  → ReviewProvider Port
  → MockReviewProvider
  → ReviewStreamEvent 判别联合
  → 终端展示
```

事件协议：

```ts
type ReviewStreamEvent =
  | { type: "review.started"; jobId: string }
  | { type: "review.delta"; text: string }
  | { type: "review.completed"; findingCount: number }
  | { type: "review.cancelled"; reason: string }
  | { type: "review.failed"; message: string };
```

关键不变量：

1. 正常执行只产生一个终止事件；
2. `AbortSignal` 进入每个等待边界；
3. 取消会清除 timer 并移除监听器；
4. 取消后不再产生 `review.delta`；
5. CLI、领域契约和 Provider 彼此解耦；
6. 测试使用假时间，不连接网络也不真实等待。

## 后续模型扩展点

真实模型实现会新增 `OpenAICompatibleReviewProvider`，继续实现同一个 `ReviewProvider`。环境配置至少包含 base URL、API key 和 model，并在服务端用运行时 Schema 校验。SDK 原生事件必须先归一化为 `ReviewStreamEvent`，不能泄漏到领域、SSE 或 React 层。

当前版本有意不读取凭据、不依赖 SDK，也不发起模型请求。
