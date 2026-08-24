import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole } from "lucide-react";
import { formatDuration, lessons } from "@/lib/course";

const futurePhases = [
  { id: "02", title: "类型系统与契约", modules: "M03–M05", duration: "5 小时", outcome: "读懂泛型、联合、unknown 与类型窄化" },
  { id: "03", title: "原生 Node.js 后端", modules: "M06–M08", duration: "6 小时", outcome: "REST、SQLite、SSE 与可靠错误处理" },
  { id: "04", title: "NestJS 与 PostgreSQL", modules: "M09–M11", duration: "6 小时", outcome: "企业框架、迁移、队列与可观测性" },
  { id: "05", title: "React 项目接手", modules: "M12–M13", duration: "4 小时", outcome: "读懂并修改数据流、状态与流式 UI" },
  { id: "06", title: "生产化与毕业审查", modules: "M14–M15", duration: "3 小时", outcome: "测试、部署、故障演练与 AI 代码审查" },
];

export default function RoadmapPage() {
  return (
    <main className="wide-page roadmap-page">
      <header className="page-heading">
        <span className="block-eyebrow runtime-text">20–30 小时 · 单项目演进</span>
        <h1>从运行时事实，到可维护的全栈 TypeScript。</h1>
        <p>零基础学习者先完成 75 分钟 P00 最低必要基础，再进入 M00–M02；P00 是前置章节，不改变已有模块编号或链接。</p>
      </header>

      <section className="roadmap-current">
        <div className="roadmap-phase-head">
          <span>01</span>
          <div>
            <small>NOW OPEN</small>
            <h2>零基础预备 + JavaScript 运行时基础</h2>
            <p>P00 先补齐读写 TypeScript 的最低能力；M00–M02 再建立证据、运行时与异步模型。</p>
          </div>
          <strong><Clock3 size={15} /> {formatDuration(lessons.reduce((sum, item) => sum + item.durationMinutes, 0))}</strong>
        </div>
        <div className="roadmap-lessons">
          {lessons.map((lesson) => (
            <Link href={`/lesson/${lesson.slug}`} key={lesson.id}>
              <CheckCircle2 size={18} />
              <span><small>{lesson.id}</small><strong>{lesson.title}</strong></span>
              <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </section>

      <div className="future-phase-list">
        {futurePhases.map((phase) => (
          <article key={phase.id}>
            <span>{phase.id}</span>
            <div><small>{phase.modules}</small><h2>{phase.title}</h2><p>{phase.outcome}</p></div>
            <strong>{phase.duration}</strong>
            <LockKeyhole size={17} aria-label="后续版本" />
          </article>
        ))}
      </div>
    </main>
  );
}
