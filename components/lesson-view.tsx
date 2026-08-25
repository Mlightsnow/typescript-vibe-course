"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Clock3,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ProgressButton } from "@/components/progress-button";
import { TsPlayground } from "@/components/ts-playground";
import { formatDuration, labs, lessons, type Lesson } from "@/lib/course";
import { labsEn, lessonsEn } from "@/lib/course-en";
import { usePreferences } from "@/lib/preferences";

const toneLabels = {
  static: "STATIC",
  runtime: "RUNTIME",
  boundary: "BOUNDARY",
  failure: "FAILURE",
  evidence: "EVIDENCE",
} as const;

export function LessonView({ slug }: { slug: string }) {
  const { locale } = usePreferences();
  const activeLessons = locale === "en" ? lessonsEn : lessons;
  const activeLabs = locale === "en" ? labsEn : labs;
  const lesson = activeLessons.find((item) => item.slug === slug) as Lesson;
  const adjacent = { previous: activeLessons[lesson.order - 1], next: activeLessons[lesson.order + 1] };
  const lessonLabs = lesson.labIds.map((labId) => activeLabs[labId]);

  return (
    <main className="lesson-layout">
      <article className="lesson-content">
        <header className="lesson-hero">
          <div className="lesson-meta-row">
            <span>{lesson.id}</span>
            <span><Clock3 size={14} /> {formatDuration(lesson.durationMinutes, locale)}</span>
            <span><GitBranch size={14} /> CodePilot {lesson.projectStage}</span>
          </div>
          <p className="lesson-kicker">{lesson.kicker}</p>
          <h1>{lesson.title}</h1>
          <p className="lesson-summary">{lesson.summary}</p>
          <div className="outcome-strip">
            <BookMarked size={19} />
            <div>
              <strong>{locale === "en" ? "By the end, you can:" : "完成后，你能："}</strong>
              <span>{lesson.outcomes.join("；")}</span>
            </div>
          </div>
        </header>

        <div className="lesson-body">
          {lesson.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="lesson-section">
              <div className="section-number">{String(index + 1).padStart(2, "0")}</div>
              <span className="block-eyebrow">{section.eyebrow}</span>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && (
                <ul className="principle-list">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
              {section.code && (
                <div className="code-block">
                  <div className="code-toolbar"><span>TypeScript</span><CopyButton value={section.code} /></div>
                  <pre><code>{section.code}</code></pre>
                </div>
              )}
              {section.callout && (
                <aside className={`concept-callout tone-${section.callout.tone}`}>
                  <span>{toneLabels[section.callout.tone]}</span>
                  <div>
                    <strong>{section.callout.title}</strong>
                    <p>{section.callout.body}</p>
                  </div>
                </aside>
              )}
              {lessonLabs[index] && <TsPlayground lab={lessonLabs[index]} />}
            </section>
          ))}

          <section className="verification-card">
            <span className="block-eyebrow evidence-text"><ShieldCheck size={15} /> {locale === "en" ? "LESSON CHECK" : "本章验收"}</span>
            <h2>{locale === "en" ? "Finish with evidence, not a feeling" : "不要凭感觉结束这一章"}</h2>
            <p>{locale === "en" ? "After the Playground, run this check from the project root. It never contacts a model." : "完成 Playground 后，在项目根目录运行预定义检查。命令不会连接外部模型。"}</p>
            <div className="command-row">
              <code>{lesson.verifyCommand}</code>
              <CopyButton value={lesson.verifyCommand} />
            </div>
            <ProgressButton lessonId={lesson.id} />
          </section>
        </div>

        <nav className="lesson-pagination" aria-label="章节翻页">
          {adjacent.previous ? (
            <Link href={`/lesson/${adjacent.previous.slug}`}>
              <ArrowLeft size={17} />
              <span><small>{locale === "en" ? "PREVIOUS" : "上一章"}</small>{adjacent.previous.title}</span>
            </Link>
          ) : <span />}
          {adjacent.next ? (
            <Link href={`/lesson/${adjacent.next.slug}`} className="next-link">
              <span><small>{locale === "en" ? "NEXT" : "下一章"}</small>{adjacent.next.title}</span>
              <ArrowRight size={17} />
            </Link>
          ) : (
            <Link href="/roadmap" className="next-link">
              <span><small>{locale === "en" ? "NEXT" : "接下来"}</small>{locale === "en" ? "View the full roadmap" : "查看完整课程地图"}</span>
              <ArrowRight size={17} />
            </Link>
          )}
        </nav>
      </article>

      <aside className="lesson-context">
        <div className="context-card">
          <span>{locale === "en" ? "IN THIS LESSON" : "本章路线"}</span>
          <ol>
            {lesson.sections.map((section) => (
              <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
            ))}
          </ol>
        </div>
        <div className="context-card">
          <span>{locale === "en" ? "KEY IDEAS" : "核心概念"}</span>
          <div className="tag-list">{lesson.concepts.map((concept) => <i key={concept}>{concept}</i>)}</div>
        </div>
        <div className="trust-mini-card">
          <strong>TRUST</strong>
          <span>Types · Runtime · Unhappy paths · Side effects · Tests</span>
        </div>
      </aside>
    </main>
  );
}
