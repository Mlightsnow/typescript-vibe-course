# Vibe Coding 时代的 TypeScript

一门从 JavaScript 运行时出发、以 AI 代码审查与可靠 Node.js 后端为目标的中文交互式课程。

这不是语法字典。课程围绕同一个项目 **CodePilot** 演进，训练三种核心能力：

- 审查并修复 AI 生成的 TypeScript；
- 读懂和修改现有 React 项目；
- 独立开发、测试和本地运行 Node.js 后端。

## 当前版本

第一阶段 P00 + M00–M02 已实现。P00 是 75 分钟的**零基础预备章节**，不会导致 M00–M02 重编号或旧书签失效：

- 响应式课程网站、课程地图与 CodePilot 项目页；
- 4 章完整中文课程，其中 P00 通过三个渐进 Playground 补齐最低必要 TypeScript 基础；
- Monaco TypeScript 编辑器、类型诊断和隔离 Web Worker 执行；
- 本地学习进度、实验草稿、全文搜索和代码复制；
- 可取消的 Mock CodePilot 流式 CLI；
- 对共享引用、唯一终止事件、取消后静默与 timer 清理的自动化测试。

按照当前约定，本版本**不读取 API Key、不安装模型 SDK、不发送模型请求**。OpenAI 兼容 Provider 会在凭据配置阶段加入。

## 环境

- Node.js 22.13+，推荐 Node.js 24 LTS
- npm 10+

## 启动

```bash
npm install
npm run dev
```

打开终端显示的本地地址。课程正文和浏览器实验无需外部服务。

## 常用命令

```bash
# 严格类型检查
npm run typecheck

# 单元测试
npm run test:unit

# 验收某一已开放章节（零基础预备章使用 P00）
npm run verify:lesson -- P00
npm run verify:lesson -- M02

# 运行不连接模型的 CodePilot P0
npm run codepilot -- "审查这段任务队列代码"

# 生产构建与产物校验
npm run build
```

CodePilot 运行时第一次按 `Ctrl+C` 会请求优雅取消，第二次会立即退出。

## 学习路径

| 阶段 | 章节 | 能力 |
|---|---|---|
| 00 零基础预备 | P00（75 分钟） | 读写值、对象、函数与基础类型；读诊断；安全窄化 unknown；理解类型擦除 |
| 01 运行时基础 | M00–M02 | 在 P00 之后学习静态证据、引用、模块、Promise、流与取消；原编号与 URL 保持不变 |
| 02 类型系统 | M03–M05 | 联合、窄化、泛型、边界校验与构建职责 |
| 03 原生 Node 后端 | M06–M07 | REST、SSE、错误协议与行为测试 |
| 04 企业后端 | M08–M12 | NestJS、SQLite → PostgreSQL、Agent、队列与观测 |
| 05 React 与交付 | M13–M14 | 读改 React、跨层功能与上线前审查 |

完整课程蓝图见 [docs/course-blueprint.md](docs/course-blueprint.md)，当前实现边界与架构见 [docs/architecture.md](docs/architecture.md)。

## 目录

```text
app/                         课程页面与路由
components/                  导航、搜索、进度与 Playground
lib/                         课程内容模型与本地状态
examples/codepilot-cli/      P0 可取消 Mock 流式 CLI
scripts/verify-lesson.mjs    章节验收入口
docs/                        课程蓝图与实现架构
```

## 可信代码规则

全课用 TRUST 顺序审查 AI 代码：

1. **Types & contracts**：类型是否表达真实约束；
2. **Runtime boundaries**：外部值是否经过运行时解析；
3. **Unhappy paths**：超时、取消、断连和部分失败是否明确；
4. **Side effects & security**：资源、密钥和副作用是否安全；
5. **Tests & telemetry**：缺陷存在时，证据是否真的失败。

## 浏览器 Playground 的安全边界

Playground 只执行课程中的纯 TypeScript：

- TypeScript Worker 负责诊断与转译；
- 生成的 JavaScript 在独立 Web Worker 中运行；
- 单次执行有 2 秒超时；
- 不暴露 Node.js API，不发送外部网络请求；
- 移动端保留编辑草稿，完整运行体验面向桌面浏览器。

## 技术栈

TypeScript、React 19、Vinext/Next-compatible routing、Vite、Monaco Editor、Vitest。课程主项目后续会加入 NestJS、Drizzle、SQLite/PostgreSQL 与 OpenAI 兼容 API 适配层。
