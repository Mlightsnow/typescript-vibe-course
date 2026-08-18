export type CoursePhase = "runtime" | "type-system" | "node-backend";

export type LessonSection = {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  code?: string;
  callout?: {
    tone: "static" | "runtime" | "boundary" | "failure" | "evidence";
    title: string;
    body: string;
  };
};

export type Lesson = {
  id: "M00" | "M01" | "M02";
  slug: string;
  order: number;
  phase: CoursePhase;
  kicker: string;
  title: string;
  summary: string;
  durationMinutes: number;
  projectStage: "P0";
  prerequisites: string[];
  outcomes: string[];
  concepts: string[];
  labId: keyof typeof labs;
  verifyCommand: string;
  sections: LessonSection[];
};

export type Lab = {
  id: string;
  lessonId: Lesson["id"];
  title: string;
  prompt: string;
  hint: string;
  initialCode: string;
};

export const labs = {
  "m00-runtime-boundary": {
    id: "m00-runtime-boundary",
    lessonId: "M00",
    title: "类型断言能保护运行时吗？",
    prompt:
      "先运行代码观察失败，再移除不安全断言：检查 JSON 的形状，并让非法输入返回明确错误。",
    hint: "JSON.parse 的结果应从 unknown 开始；检查对象、code 字段和字符串类型。",
    initialCode: `type ReviewInput = { code: string };

function parseReviewInput(raw: string): ReviewInput {
  return JSON.parse(raw) as ReviewInput;
}

const input = parseReviewInput('{"code": 42}');
console.log(input.code.toUpperCase());`,
  },
  "m01-shared-reference": {
    id: "m01-shared-reference",
    lessonId: "M01",
    title: "两个任务为什么共享标签？",
    prompt:
      "预测输出并运行。然后修改 createJob，让每个任务拥有独立的 tags 数组。",
    hint: "对象展开只复制第一层；数组仍然可能指向同一个对象。",
    initialCode: `type Job = { id: string; tags: string[] };

const defaults = { tags: [] as string[] };

function createJob(id: string): Job {
  return { id, tags: defaults.tags };
}

const first = createJob("job-1");
const second = createJob("job-2");
first.tags.push("urgent");

console.log("first", first.tags);
console.log("second", second.tags);`,
  },
  "m02-event-order": {
    id: "m02-event-order",
    lessonId: "M02",
    title: "await 在等待谁？",
    prompt:
      "先写下 A–E 的输出顺序，再运行。尝试把 await Promise.resolve() 移到不同位置并解释变化。",
    hint: "同步代码先执行；Promise continuation 进入微任务；timer 进入后续任务。",
    initialCode: `console.log("A");

setTimeout(() => console.log("B: timer"), 0);

Promise.resolve().then(() => console.log("C: microtask"));

(async () => {
  console.log("D: before await");
  await Promise.resolve();
  console.log("E: after await");
})();`,
  },
} satisfies Record<string, Lab>;

export const lessons: Lesson[] = [
  {
    id: "M00",
    slug: "ai-code-human-responsibility",
    order: 0,
    phase: "runtime",
    kicker: "开始之前",
    title: "AI 写完代码后，人负责什么？",
    summary:
      "建立第一条底线：编译通过只是静态证据，真正可信还需要运行时边界、异常路径、测试和观测。",
    durationMinutes: 30,
    projectStage: "P0",
    prerequisites: [],
    outcomes: [
      "区分编辑器、类型检查、转译、运行和测试的职责",
      "用 TRUST 五层框架审查 AI 生成代码",
      "识别类型断言、吞异常和伪测试带来的虚假安全感",
    ],
    concepts: ["可信证据", "类型擦除", "TRUST", "运行时边界"],
    labId: "m00-runtime-boundary",
    verifyCommand: "npm run verify:lesson -- M00",
    sections: [
      {
        id: "compile-is-not-proof",
        eyebrow: "真实失败",
        title: "“没有红线”不等于“输入可信”",
        paragraphs: [
          "TypeScript 检查的是源码中能看到的关系。网络请求、环境变量、数据库行和模型输出都在程序运行后才出现；它们不会因为你写了一个类型名称就自动改变形状。",
          "AI 很擅长生成看起来完整的接口和断言，也很容易把 JSON.parse 的结果直接写成 as SomeType。此时代码可能零类型错误，却在第一条异常输入上崩溃。",
        ],
        code: `const payload = JSON.parse(body) as ReviewInput;
return payload.code.toUpperCase();`,
        callout: {
          tone: "failure",
          title: "先问证据来源",
          body: "as 只修改编译器的看法，不会验证 payload。边界数据应从 unknown 开始。",
        },
      },
      {
        id: "five-layers",
        eyebrow: "心智模型",
        title: "同一段代码要经过五层才抵达用户",
        paragraphs: [
          "编辑器提供反馈，tsc 做全局类型检查，构建工具把源码变成可执行 JavaScript，运行时处理真实输入，测试则尝试反证行为。任何一层通过，都不能替代其他层。",
        ],
        bullets: [
          "编辑器：快速提示，不是最终裁判",
          "类型检查：排除一部分不可能，但不运行代码",
          "转译/打包：生成产物，可能根本不做类型检查",
          "运行时：决定真实副作用、异常和资源生命周期",
          "测试与观测：提供行为证据，并帮助定位失败",
        ],
        callout: {
          tone: "static",
          title: "Vite 的典型边界",
          body: "Vite 会转译 TypeScript，但默认不替你做全项目类型检查。生产门禁仍需单独运行 tsc。",
        },
      },
      {
        id: "trust-review",
        eyebrow: "审查方法",
        title: "用 TRUST 代替“看起来没问题”",
        paragraphs: [
          "T 看类型与契约，R 看运行时边界，U 看异常路径，S 看副作用与安全，最后一个 T 看测试与观测。后续每章都会用相同次序检查 AI Bad Case。",
        ],
        bullets: [
          "Types & contracts：非法状态是否仍能构造？",
          "Runtime boundaries：外部值是否真正解析？",
          "Unhappy paths：超时、取消、断连会发生什么？",
          "Side effects & security：密钥、文件和资源是否安全？",
          "Tests & telemetry：缺陷存在时，证据会失败吗？",
        ],
      },
    ],
  },
  {
    id: "M01",
    slug: "javascript-is-the-runtime",
    order: 1,
    phase: "runtime",
    kicker: "运行时基础",
    title: "JavaScript 才是运行时",
    summary:
      "从值、引用、闭包和模块初始化出发，建立能预测 JavaScript 行为的模型，而不是把 TypeScript 当成 Java。",
    durationMinutes: 105,
    projectStage: "P0",
    prerequisites: ["M00"],
    outcomes: [
      "预测对象引用与浅拷贝的行为",
      "解释闭包捕获、this 绑定和模块副作用",
      "安全处理任意 throw 值",
    ],
    concepts: ["值与引用", "闭包", "this", "ESM", "unknown error"],
    labId: "m01-shared-reference",
    verifyCommand: "npm run verify:lesson -- M01",
    sections: [
      {
        id: "values-and-identities",
        eyebrow: "第一性问题",
        title: "变量保存的是对象，还是对象的引用？",
        paragraphs: [
          "原始值可以直接比较其值；对象变量持有的是指向对象身份的引用。把对象赋给另一个变量不会复制对象，展开运算符也只创建一层新对象。",
          "这解释了许多 AI 生成代码中的隐蔽污染：默认配置包含数组，工厂函数每次复用同一个数组，测试单独运行通过，并发任务却互相修改。",
        ],
        code: `const base = { options: { retries: 2 } };
const copy = { ...base };
copy.options.retries = 9;
console.log(base.options.retries); // 9`,
        callout: {
          tone: "runtime",
          title: "类型相同，身份仍不同",
          body: "TypeScript 能描述对象形状，但不会自动复制对象或保证不可变。",
        },
      },
      {
        id: "closures-and-this",
        eyebrow: "行为来源",
        title: "闭包记住词法环境，this 取决于调用方式",
        paragraphs: [
          "闭包不是把某个值拍成快照，而是保留对词法环境的访问。this 则不是普通词法变量：把方法提取成独立函数后，调用方式改变，this 也可能改变。",
          "后端代码里更稳定的默认选择是显式参数和小型闭包。需要对象生命周期时再使用类，并在边界处明确绑定。",
        ],
        bullets: [
          "箭头函数捕获外层 this",
          "普通函数的 this 由调用点决定",
          "闭包共享可变状态时，需要明确所有权和并发语义",
        ],
      },
      {
        id: "modules-and-errors",
        eyebrow: "模块边界",
        title: "导入会执行代码，throw 可以抛出任何值",
        paragraphs: [
          "ESM 模块首次加载时会执行顶层代码并缓存结果。顶层创建连接、读取环境变量或启动 timer，会让导入顺序影响测试和应用生命周期。",
          "JavaScript 允许 throw 字符串、对象甚至 null，因此 catch 变量应保持 unknown，经过窄化后再读取 message。",
        ],
        callout: {
          tone: "boundary",
          title: "模块应暴露能力，而不是偷偷启动能力",
          body: "优先导出 createXxx()，让入口文件显式决定初始化与关闭时机。",
        },
      },
      {
        id: "project-p0-sync",
        eyebrow: "CodePilot P0",
        title: "先做一个没有框架的同步审查任务",
        paragraphs: [
          "本章只建立 ReviewJob、创建函数和最小 CLI。领域状态不依赖 NestJS、数据库或模型 SDK，后续才能在不改契约的前提下替换外层技术。",
        ],
        bullets: [
          "每次 createReviewJob 都创建独立状态",
          "入口负责解析参数，领域函数不读取 process.argv",
          "错误以 AppError 返回，CLI 决定如何展示和设置退出码",
        ],
      },
    ],
  },
  {
    id: "M02",
    slug: "async-is-a-protocol",
    order: 2,
    phase: "runtime",
    kicker: "异步与流",
    title: "异步不是语法糖",
    summary:
      "把 Promise、AsyncIterable、取消和资源清理连接成一套协议，完成可流式输出、可超时、可 Ctrl+C 取消的 Mock 审查 CLI。",
    durationMinutes: 105,
    projectStage: "P0",
    prerequisites: ["M01"],
    outcomes: [
      "解释同步代码、微任务和 timer 的执行顺序",
      "用 AsyncIterable 表达增量事件",
      "使用 AbortSignal 贯穿超时、用户取消与清理",
    ],
    concepts: ["event loop", "Promise", "AsyncIterable", "AbortSignal", "finally"],
    labId: "m02-event-order",
    verifyCommand: "npm run verify:lesson -- M02",
    sections: [
      {
        id: "event-loop",
        eyebrow: "第一性问题",
        title: "await 把后续工作交给了谁？",
        paragraphs: [
          "async 函数会立即运行到第一个 await。await 之后的 continuation 会以微任务继续，而 timer 回调要等后续任务阶段。它们不是并行线程，只是被调度到不同队列。",
          "理解顺序不是为了背事件循环的所有阶段，而是为了判断错误传播、取消和清理究竟何时发生。",
        ],
        callout: {
          tone: "runtime",
          title: "先画时间线，再加 await",
          body: "当代码的正确性依赖执行顺序时，先写出同步段、微任务和外部事件，再审查实现。",
        },
      },
      {
        id: "promise-errors",
        eyebrow: "错误路径",
        title: "Promise 没有被等待，错误也不会自动回到调用者",
        paragraphs: [
          "遗漏 await 或 return 会产生浮动 Promise。外层 try/catch 只包住同步启动阶段，异步 rejection 可能晚些发生，甚至成为未处理 rejection。",
          "不要用 catch(() => undefined) 消除告警。先决定错误由谁负责，再选择传播、转换、重试或记录。",
        ],
        code: `async function start() {
  try {
    runReview(); // 没有 await，也没有 return
  } catch (error) {
    // 捕获不到 runReview 之后的 rejection
  }
}`,
      },
      {
        id: "async-iterable",
        eyebrow: "增量协议",
        title: "流不是一串回调，而是一组有生命周期的事件",
        paragraphs: [
          "AsyncIterable 允许消费者用 for await...of 拉取增量值，并自然表达正常完成、抛错和提前停止。对 AI 输出而言，事件联合比裸字符串更稳定：它能区分 started、delta、completed、cancelled 和 failed。",
        ],
        bullets: [
          "终止事件只能出现一次",
          "取消后不能继续产生 delta",
          "消费者提前退出时，生成器 finally 必须释放 timer 或连接",
        ],
      },
      {
        id: "abort-cleanup",
        eyebrow: "可靠性",
        title: "取消是一条贯穿调用链的协议",
        paragraphs: [
          "AbortSignal 应从入口传到每个会阻塞的边界。超时和 Ctrl+C 可以拥有不同 AbortController，但应转换成统一的领域取消原因。",
          "finally 是释放资源的最后防线。它必须在正常完成、失败、取消和消费者提前 break 时都执行。",
        ],
        callout: {
          tone: "evidence",
          title: "测试取消后的静默",
          body: "不仅断言收到了 cancelled，还要推进时间并证明之后没有 delta，timer 也已清理。",
        },
      },
      {
        id: "project-p0-stream",
        eyebrow: "CodePilot P0",
        title: "完成可取消的 Mock 流式 CLI",
        paragraphs: [
          "CLI 使用 MockReviewProvider 逐步产生审查文本，不连接任何外部模型。第一次 Ctrl+C 请求优雅取消，第二次 Ctrl+C 立即退出。",
        ],
        bullets: [
          "领域层只认识 ReviewStreamEvent 与 AbortSignal",
          "Provider 负责产生事件，CLI 负责展示",
          "测试使用可控延迟，不依赖真实等待和真实模型",
        ],
      },
    ],
  },
];

export const lessonBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export const labList = Object.values(labs);

export const searchItems = [
  ...lessons.flatMap((lesson) => [
    {
      id: lesson.id,
      title: `${lesson.id} · ${lesson.title}`,
      description: lesson.summary,
      href: `/lesson/${lesson.slug}`,
      keywords: [...lesson.concepts, ...lesson.outcomes].join(" "),
      kind: "章节",
    },
    ...lesson.sections.map((section) => ({
      id: `${lesson.id}-${section.id}`,
      title: section.title,
      description: section.paragraphs[0],
      href: `/lesson/${lesson.slug}#${section.id}`,
      keywords: `${lesson.concepts.join(" ")} ${section.code ?? ""}`,
      kind: "原理",
    })),
  ]),
  {
    id: "trust",
    title: "TRUST AI 代码审查框架",
    description: "类型、运行时边界、异常路径、副作用与安全、测试与观测。",
    href: "/lesson/ai-code-human-responsibility#trust-review",
    keywords: "Types Runtime Unhappy paths Side effects Tests telemetry 审查",
    kind: "速查",
  },
];

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`;
}

export function getAdjacentLessons(lesson: Lesson) {
  return {
    previous: lessons[lesson.order - 1],
    next: lessons[lesson.order + 1],
  };
}
