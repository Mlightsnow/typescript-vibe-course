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
  id: "P00" | "M00" | "M01" | "M02";
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
  labIds: (keyof typeof labs)[];
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
  expectedDiagnostics?: string;
  expectedOutput?: string;
  solution?: string;
};

export const labs = {
  "p00-type-task": {
    id: "p00-type-task",
    lessonId: "P00",
    title: "Playground 1 · 为任务对象补全类型",
    prompt: "先猜猜它会打印任务标题还是 undefined，再点运行。然后给 task 写清楚它应该有哪些字段，看看编辑器怎样帮你抓住拼错的 titel。",
    hint: "先写 type ReviewTask，其中 title 是文字、priority 是数字、assignee 可以不填；再把 titel 改回 title。",
    initialCode: `function formatTask(task) {
  return \`[\${task.priority}] \${task.titel}\`;
}

console.log(formatTask({ title: "检查登录", priority: 1 }));`,
    expectedDiagnostics: "一开始，编辑器会说 task 没有类型。补上 ReviewTask 后，它会进一步指出：没有 titel 这个属性，你可能想写 title。",
    expectedOutput: "修复前：[1] undefined；修复后：[1] 检查登录",
    solution: `type ReviewTask = {
  title: string;
  priority: number;
  assignee?: string;
};

function formatTask(task: ReviewTask): string {
  return \`[\${task.priority}] \${task.title}\`;
}

console.log(formatTask({ title: "检查登录", priority: 1 }));`,
  },
  "p00-task-status": {
    id: "p00-task-status",
    lessonId: "P00",
    title: "Playground 2 · 用联合类型表示状态",
    prompt: "先猜 blocked 和 typo 会显示什么。然后把“任意文字”收紧为四个允许的状态，并单独处理 blocked。",
    hint: "把 TaskStatus 改成 \"todo\" | \"reviewing\" | \"done\" | \"blocked\"。这就像给状态做了一张只允许四个选项的菜单。",
    initialCode: `type TaskStatus = string;

function statusLabel(status: TaskStatus): string {
  if (status === "done") return "已完成";
  if (status === "reviewing") return "审查中";
  return "待处理";
}

console.log(statusLabel("blocked"));
console.log(statusLabel("typo"));`,
    expectedDiagnostics: "TaskStatus 是 string 时不会报错；改成四个选项后，编辑器会告诉你 typo 不在允许的状态里。",
    expectedOutput: "补全分支后：已阻塞；删除非法调用后不再输出 typo 对应结果。",
    solution: `type TaskStatus = "todo" | "reviewing" | "done" | "blocked";

function statusLabel(status: TaskStatus): string {
  if (status === "done") return "已完成";
  if (status === "reviewing") return "审查中";
  if (status === "blocked") return "已阻塞";
  return "待处理";
}

console.log(statusLabel("blocked"));`,
  },
  "p00-unknown-input": {
    id: "p00-unknown-input",
    lessonId: "P00",
    title: "Playground 3 · 安全读取 unknown",
    prompt: "把 value 想成别人递来的未拆包裹：先直接读 title 看报错，再逐层确认它是对象、确实有 title，而且 title 是文字。",
    hint: "检查顺序：typeof value === \"object\"；value !== null；\"title\" in value；最后 typeof value.title === \"string\"。",
    initialCode: `function readTitle(value: unknown): string {
  return value.title.toUpperCase();
}

console.log(readTitle({ title: "security review" }));`,
    expectedDiagnostics: "编辑器会阻止你直接读取 value.title，因为 unknown 的意思是“现在还不知道里面是什么”。",
    expectedOutput: "SECURITY REVIEW",
    solution: `function readTitle(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    typeof value.title === "string"
  ) {
    return value.title.toUpperCase();
  }
  return "UNTITLED";
}

console.log(readTitle({ title: "security review" }));`,
  },
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
    id: "P00",
    slug: "typescript-basics",
    order: 0,
    phase: "runtime",
    kicker: "零基础预备章节",
    title: "第一次读懂 TypeScript",
    summary: "不背术语表。我们用一个小小的 CodePilot 任务清单，边运行、边猜结果、边改代码，学会看懂后面课程真正会用到的 TypeScript。",
    durationMinutes: 75,
    projectStage: "P0",
    prerequisites: [],
    outcomes: [
      "用自己的话说明 TypeScript、JavaScript、Node.js 和浏览器分别做什么",
      "看懂 CodePilot 里的变量、任务对象、函数和任务状态",
      "遇到红色报错时知道先看哪里，并能安全处理来路不明的数据",
    ],
    concepts: ["最低必要语法", "类型推断", "联合与窄化", "unknown", "类型擦除"],
    labIds: ["p00-type-task", "p00-task-status", "p00-unknown-input"],
    verifyCommand: "npm run verify:lesson -- P00",
    sections: [
      {
        id: "runtime-map", eyebrow: "第一步 · 先运行", title: "这四个名字到底是什么关系？",
        paragraphs: ["把 JavaScript 想成一份菜谱，浏览器和 Node.js 是两间能照着菜谱做菜的厨房。浏览器这间厨房擅长操作网页；Node.js 那间厨房擅长读文件、开服务器。它们执行的都是 JavaScript。", "TypeScript 像写菜谱时站在旁边的校对员。它让你提前写清楚“这里应该是文字，那里应该是数字”，并在运行前圈出可疑的地方。检查结束后，类型标记会被拿掉，交给浏览器或 Node.js 的仍然是 JavaScript。先猜下面会显示什么，再运行。然后把 message 改成 42，看看校对员怎么提醒你。"],
        code: `const message = "CodePilot ready";\nconsole.log(message.toUpperCase());`,
        callout: { tone: "runtime", title: "先记住一句话", body: "TypeScript 负责提前提醒；JavaScript 负责真正运行。浏览器和 Node.js 是两个不同的 JavaScript 运行环境。" },
      },
      {
        id: "values", eyebrow: "第二步 · 给数据起名字", title: "先学会看懂最常见的五种值",
        paragraphs: ["程序大部分时间都在保存和处理数据。\"CodePilot\" 是字符串，也就是文字；1 是数字；true 是“是/否”值。null 常用来表示“这里明确没有东西”，undefined 常表示“还没有给值”。", "const 表示这个名字之后不会改指向别的值，let 表示之后还会重新赋值。先猜下面五个值会怎样显示，再运行。接着把 count += 1 改成 count = \"two\"：数字位置突然放进文字，编辑器会在运行前拦住你。"],
        code: `const project = "CodePilot";\nlet count = 1;\nconst enabled = true;\nconst owner: string | null = null;\nlet note: string | undefined;\ncount += 1;\nconsole.log(project, count, enabled, owner, note);`,
      },
      {
        id: "collections", eyebrow: "第三步 · 组成一条任务", title: "对象像一张任务卡，数组像一叠任务卡",
        paragraphs: ["一条审查任务不只有一个值：它有标题、标签，还可能有负责人。对象用一对大括号把这些相关信息放在一起；数组用一对方括号保存一组项目。task.title 就是读取任务卡上的 title 一栏。", "assignee 后面的 ? 表示“负责人可以不填”，task.assignee?.toUpperCase() 里的 ?. 表示只有负责人存在时才继续。先猜输出，再删掉 ?. 看报错。接下来的 Playground 会让你亲手为一张没有类型的任务卡补上说明。"],
        code: `type ReviewTask = { title: string; tags: string[]; assignee?: string };\nconst task: ReviewTask = { title: "检查边界", tags: ["security"] };\nconsole.log(task.title, task["tags"][0]);\nconsole.log(task.assignee?.toUpperCase() ?? "未分配");`,
      },
      {
        id: "functions", eyebrow: "第四步 · 重复使用一段动作", title: "函数就是一台有入口和出口的小机器",
        paragraphs: ["把 title 放进 format，它会送回大写文字。括号里的 title: string 说明入口只收文字，括号后的 : string 说明出口也是文字。箭头函数只是函数的一种较短写法。", "renderAll 还接收另一个函数 render，这种“交给别的函数稍后调用的函数”叫回调。先猜数组会变成什么，再把 format 的出口类型从 string 改成 number。读报错时先找两件事：实际拿到什么、这里原本要什么。"],
        code: `const format = (title: string): string => title.toUpperCase();\nfunction renderAll(items: string[], render: (item: string) => string): string[] {\n  return items.map(render);\n}\nconsole.log(renderAll(["types", "runtime"], format));`,
      },
      {
        id: "type-language", eyebrow: "第五步 · 限制允许的选项", title: "不是所有文字都算合法状态",
        paragraphs: ["inferred 后面没写 : string，但编辑器看到右边是文字，仍能自己猜出来，这叫类型推断。通常不用给每个变量都补标签；当规则不明显时再写。", "竖线 | 可以表达“几种可能之一”。例如 Priority 只允许 1、2、3，而不是任意数字；任务状态也应该只允许 todo、reviewing、done、blocked，而不是任意拼写。第二个 Playground 会先让错误混过去，再把入口收紧，亲眼看见 typo 被拦住。"],
        code: `let inferred = "review";\ntype Priority = 1 | 2 | 3;\ntype Result = string | null;\nconst priority: Priority = 1;\nconst result: Result = priority === 1 ? "urgent" : null;\nconsole.log(inferred, result);`,
      },
      {
        id: "aliases-interfaces", eyebrow: "第六步 · 给规则起名字", title: "type 和 interface 先不用二选一",
        paragraphs: ["规则写长了会很难读，所以我们给规则起名字。type TaskStatus 给四个状态起了一个总名；interface ReviewResult 列出一份审查结果必须填写的栏目。extends 表示 DetailedResult 在原有栏目之外再多一个 findings。", "初学时记一个够用的习惯：几个固定选项常用 type，对象表格常用 interface。先运行，再删掉 result 里的 summary；编辑器会像检查漏填表格一样告诉你少了哪一栏。"],
        code: `type TaskStatus = "todo" | "done";\ninterface ReviewResult { summary: string; status: TaskStatus }\ninterface DetailedResult extends ReviewResult { findings: number }\nconst result: DetailedResult = { summary: "通过", status: "done", findings: 0 };\nconsole.log(\`\${result.summary}: \${result.findings}\`);`,
      },
      {
        id: "unknown-any", eyebrow: "第七步 · 拆开外部数据", title: "不知道是什么，就先别假装知道",
        paragraphs: ["网络响应、用户输入和 JSON 文件都像别人递来的包裹。any 是闭着眼说“里面肯定没问题”，编辑器从此不再提醒；unknown 是诚实地说“我还不知道”，必须拆开检查后才能使用。", "所以外部数据优先用 unknown。第三个 Playground 会阻止你直接读 title。请不要用 any 消掉红线，而是用 typeof 和属性检查，一步步证明它真的有一个字符串 title。"],
        code: `const unsafe: any = 42;\n// unsafe.toUpperCase() 会通过类型检查，却在运行时失败\nconst input: unknown = { title: "review" };\nconsole.log(typeof input);`,
        callout: { tone: "boundary", title: "红线是在帮你省调试时间", body: "先读第一条错误：代码实际给了什么？这里要求什么？一次只改一处，再看错误是否消失。" },
      },
      {
        id: "erasure", eyebrow: "最后一步 · 看清类型的边界", title: "程序跑起来以后，类型标签已经不在了",
        paragraphs: ["还记得开头的校对员吗？检查完成后，ReviewTask、: string 这些给校对员看的标记会被删掉，留下普通 JavaScript 去运行。它们能提前发现源码里的问题，却不会替你检查网络真的传来了什么。", "这就是为什么前面要认真区分 unknown 和 any。到这里，你已经能读懂后续课程的基本代码：M00 会讲怎样判断 AI 写的代码靠不靠谱，M01 会解释 JavaScript 真实怎样运行，M02 再处理需要等待的异步任务。"],
        code: `type ReviewTask = { title: string };\nfunction titleOf(task: ReviewTask): string { return task.title; }\nconsole.log(titleOf({ title: "检查类型擦除" }));`,
        callout: { tone: "static", title: "类型不是运行时保镖", body: "类型只在写代码和编译时提醒你。网络、JSON、存储或 AI 返回的真实数据，仍要在程序运行时亲自检查。" },
      },
    ],
  },
  {
    id: "M00",
    slug: "ai-code-human-responsibility",
    order: 1,
    phase: "runtime",
    kicker: "开始之前",
    title: "AI 写完代码后，人负责什么？",
    summary:
      "编辑器没有红线，不代表代码真的安全。本章学一套简单检查顺序，判断 AI 写的代码遇到真实输入和失败情况时会不会出问题。",
    durationMinutes: 30,
    projectStage: "P0",
    prerequisites: ["P00"],
    outcomes: [
      "分清编辑器提醒、类型检查、构建、真正运行和测试各自能证明什么",
      "按 TRUST 的五个问题检查 AI 生成代码",
      "发现那些“看起来安全、实际上没检查”的写法",
    ],
    concepts: ["可信证据", "类型擦除", "TRUST", "运行时边界"],
    labIds: ["m00-runtime-boundary"],
    verifyCommand: "npm run verify:lesson -- M00",
    sections: [
      {
        id: "compile-is-not-proof",
        eyebrow: "真实失败",
        title: "编辑器没报错，为什么程序还是会崩？",
        paragraphs: [
          "TypeScript 只能检查写在源码里的信息。网络响应、环境变量、数据库记录和 AI 返回内容，要等程序跑起来才真正出现。给它们写上一个类型名字，不会把坏数据自动变好。",
          "例如下面的 as ReviewInput 只是告诉编辑器“请相信我”。如果实际收到的 code 是数字，下一行仍会在运行时崩溃。先预测错误，再去 Playground 把输入检查补完整。",
        ],
        code: `const payload = JSON.parse(body) as ReviewInput;
return payload.code.toUpperCase();`,
        callout: {
          tone: "failure",
          title: "as 是承诺，不是检查",
          body: "as 只会让编辑器暂时相信你，不会检查真实数据。来路不明的数据应该先当作 unknown。",
        },
      },
      {
        id: "five-layers",
        eyebrow: "心智模型",
        title: "一段代码从写完到用户用上，要过五道关",
        paragraphs: [
          "编辑器先给即时提示，tsc 再检查整个项目，构建工具把源码变成可运行的 JavaScript，程序随后处理真实输入，测试则主动尝试把它弄坏。过了某一道关，不等于其他关也安全。",
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
        title: "别凭感觉，用五个问题检查 AI 代码",
        paragraphs: [
          "TRUST 只是五个检查问题的缩写：输入输出说清楚了吗？外部数据检查了吗？失败时怎么办？会不会误删文件或泄露密钥？测试真的能抓住错误吗？后续章节会重复使用这套顺序。",
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
    order: 2,
    phase: "runtime",
    kicker: "运行时基础",
    title: "JavaScript 才是运行时",
    summary:
      "TypeScript 最后会变成 JavaScript。本章用几个能亲手运行的小例子，弄懂对象为什么会互相影响、函数会记住什么，以及导入文件时发生了什么。",
    durationMinutes: 105,
    projectStage: "P0",
    prerequisites: ["M00"],
    outcomes: [
      "预测对象引用与浅拷贝的行为",
      "解释闭包捕获、this 绑定和模块副作用",
      "安全处理任意 throw 值",
    ],
    concepts: ["值与引用", "闭包", "this", "ESM", "unknown error"],
    labIds: ["m01-shared-reference"],
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
    order: 3,
    phase: "runtime",
    kicker: "异步与流",
    title: "异步不是语法糖",
    summary:
      "有些工作不会马上完成，比如等待 AI 返回结果。本章先学会预测代码的先后顺序，再做一个能逐段输出、能超时、也能按 Ctrl+C 取消的模拟审查工具。",
    durationMinutes: 105,
    projectStage: "P0",
    prerequisites: ["M01"],
    outcomes: [
      "解释同步代码、微任务和 timer 的执行顺序",
      "用 AsyncIterable 表达增量事件",
      "使用 AbortSignal 贯穿超时、用户取消与清理",
    ],
    concepts: ["event loop", "Promise", "AsyncIterable", "AbortSignal", "finally"],
    labIds: ["m02-event-order"],
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
