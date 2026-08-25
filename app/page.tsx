"use client";

import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Bug,
  Layers3,
  PlayCircle,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { DashboardProgress } from "@/components/dashboard-progress";
import { formatDuration, lessons } from "@/lib/course";
import { lessonsEn } from "@/lib/course-en";
import { usePreferences } from "@/lib/preferences";

export default function Home() {
  const { locale } = usePreferences();
  const en = locale === "en";
  const activeLessons = en ? lessonsEn : lessons;
  const mentalModels = [
    { icon: <PlayCircle size={20} />, label: "RUNTIME", title: en ? "Predict real behavior first" : "先预测真实行为", body: en ? "JavaScript values, references, scheduling, and resources decide what the program actually does." : "JavaScript 的值、引用、事件循环与资源生命周期，决定代码最终做什么。", className: "runtime-model" },
    { icon: <Braces size={20} />, label: "STATIC", title: en ? "Then use type constraints" : "再利用类型约束", body: en ? "TypeScript is early evidence, not runtime magic. Make mistakes visible before execution." : "TypeScript 是静态证据，不是运行时魔法。用契约让错误更早暴露。", className: "static-model" },
    { icon: <ShieldCheck size={20} />, label: "EVIDENCE", title: en ? "Finish with evidence" : "最后用证据收口", body: en ? "Failure paths, tests, and observability determine whether AI-generated code deserves trust." : "异常路径、自动化测试和观测信息，决定 AI 代码是否值得信任。", className: "evidence-model" },
  ];
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="release-pill"><i /> {en ? "Phase one is open · P00 + M00–M02" : "第一阶段现已开放 · P00 + M00–M02"}</span>
          <p className="hero-kicker">TYPE · RUNTIME · EVIDENCE</p>
          <h1>{en ? <>Do not just make AI code faster.<br /><em>Judge it better.</em></> : <>别只让 AI 写得快。<br /><em>让你判断得准。</em></>}</h1>
          <p className="hero-lead">
            {en ? "A first-principles TypeScript course built around one AI coding assistant. Review generated code, modify React, and gradually build a reliable Node.js backend." : "一门从第一性原理出发的 TypeScript 课程。用同一个 AI 编程助手项目，学会审查生成代码、修改 React 项目，并逐步构建可靠的 Node.js 后端。"}
          </p>
          <div className="hero-actions">
            <Link href="/lesson/typescript-basics" className="primary-link large-link">
              {en ? "Start the first lesson" : "开始第一章"} <ArrowRight size={18} />
            </Link>
            <Link href="/roadmap" className="text-link">{en ? "View the 20–30 hour roadmap" : "查看 20–30 小时课程地图"}</Link>
          </div>
          <div className="hero-facts">
            <span><Bug size={16} /> {en ? "Driven by AI failure cases" : "AI Bad Case 驱动"}</span>
            <span><Radio size={16} /> {en ? "Streaming backend project" : "流式后端主线"}</span>
            <span><Layers3 size={16} /> {en ? "Plain Node → NestJS" : "原生 Node → NestJS"}</span>
          </div>
        </div>

        <div className="hero-model" aria-label="课程心智模型">
          <div className="model-rail"><span>{en ? "INPUT" : "输入"}</span><i /><span>{en ? "TRUSTED OUTPUT" : "可信输出"}</span></div>
          {mentalModels.map((model, index) => (
            <article key={model.label} className={`model-card ${model.className}`}>
              <span className="model-index">0{index + 1}</span>
              <div className="model-icon">{model.icon}</div>
              <div>
                <small>{model.label}</small>
                <h2>{model.title}</h2>
                <p>{model.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <DashboardProgress />

      <section className="home-section">
        <header className="section-heading">
          <div>
            <span className="block-eyebrow runtime-text">PHASE 01 · {en ? "RUNTIME FOUNDATIONS" : "运行时基础"}</span>
            <h2>{en ? "Build judgment that frameworks cannot hide" : "先建立不会被框架掩盖的判断力"}</h2>
          </div>
          <p>4 {en ? "lessons" : "章"} · {formatDuration(activeLessons.reduce((total, lesson) => total + lesson.durationMinutes, 0), locale)} · P00–M02 {en ? "open" : "全部开放"}</p>
        </header>
        <div className="lesson-card-grid">
          {activeLessons.map((lesson) => (
            <Link key={lesson.id} href={`/lesson/${lesson.slug}`} className="lesson-card">
              <div className="lesson-card-top">
                <span>{lesson.id}</span>
                <small>{formatDuration(lesson.durationMinutes, locale)}</small>
              </div>
              <p>{lesson.kicker}</p>
              <h3>{lesson.title}</h3>
              <span className="lesson-card-summary">{lesson.summary}</span>
              <div className="concept-row">
                {lesson.concepts.slice(0, 3).map((concept) => <i key={concept}>{concept}</i>)}
              </div>
              <strong>{en ? "Open lesson" : "进入章节"} <ArrowRight size={16} /></strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-banner">
        <div className="trust-word">TRUST</div>
        <div>
          <span className="block-eyebrow evidence-text">{en ? "THE REVIEW FRAMEWORK" : "贯穿全课的审查框架"}</span>
          <h2>{en ? "Check five layers before accepting AI-generated code." : "每次接受 AI 代码前，顺序检查五层证据。"}</h2>
          <p>Types & contracts · Runtime boundaries · Unhappy paths · Side effects & security · Tests & telemetry</p>
        </div>
        <Link href="/lesson/ai-code-human-responsibility#trust-review" className="round-link" aria-label="学习 TRUST 框架">
          <ArrowRight size={20} />
        </Link>
      </section>

      <section className="project-preview">
        <div>
          <span className="block-eyebrow static-text">{en ? "COURSE PROJECT" : "贯穿项目"} · CODEPILOT</span>
          <h2>{en ? "Grow a 40-line mock CLI into a reliable AI backend." : "从 40 行 Mock CLI，演进到可靠的 AI 应用后端。"}</h2>
          <p>{en ? "P0 needs no model credentials. First make events, cancellation, and tests correct." : "当前 P0 不需要模型凭据：先把事件协议、取消语义和测试证据做对。"}</p>
          <Link href="/project" className="text-link">{en ? "View project status" : "查看项目状态"} <ArrowRight size={15} /></Link>
        </div>
        <div className="terminal-preview" aria-label="CodePilot 流式输出示例">
          <div><i className="dot-red" /><i className="dot-yellow" /><i className="dot-green" /><span>codepilot — mock review</span></div>
          <pre><code><span>$ npm run codepilot --</span> &quot;审查这段任务队列代码&quot;{`\n`}
<b>◇</b> review.started{`\n`}
<b>│</b> 检查异步边界与资源清理…{`\n`}
<b>│</b> 发现：取消后 timer 仍在运行{`\n`}
<strong>◆ review.completed</strong></code></pre>
        </div>
      </section>
    </main>
  );
}
