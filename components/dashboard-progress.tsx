"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { lessons } from "@/lib/course";
import { lessonsEn } from "@/lib/course-en";
import { usePreferences } from "@/lib/preferences";
import { useCourseProgress } from "@/lib/progress";

export function DashboardProgress() {
  const { progress } = useCourseProgress();
  const { locale } = usePreferences();
  const activeLessons = locale === "en" ? lessonsEn : lessons;
  const completed = progress.completedLessons.length;
  const percent = Math.round((completed / activeLessons.length) * 100);
  const last = progress.lastLesson
    ? activeLessons.find((lesson) => lesson.id === progress.lastLesson)
    : undefined;
  const next = last ?? activeLessons.find((lesson) => !progress.completedLessons.includes(lesson.id)) ?? activeLessons[0];

  return (
    <section className="dashboard-progress-card">
      <div className="progress-ring" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}>
        <span>{percent}%</span>
      </div>
      <div>
        <span className="block-eyebrow evidence-text"><CheckCircle2 size={14} /> {locale === "en" ? "LOCAL PROGRESS" : "本地学习进度"}</span>
        <h2>{completed ? (locale === "en" ? `${completed} / ${activeLessons.length} lessons complete` : `已完成 ${completed} / ${activeLessons.length} 章`) : (locale === "en" ? "Start with the first runtime fact" : "从第一条运行时事实开始")}</h2>
        <p>{locale === "en" ? "Progress stays in this browser. No account required." : "进度只保存在当前浏览器，不需要登录。"}</p>
      </div>
      <Link href={`/lesson/${next.slug}`} className="primary-link">
        {progress.lastLesson ? (locale === "en" ? "Continue" : "继续学习") : (locale === "en" ? "Start P00" : "开始 P00")} <ArrowRight size={17} />
      </Link>
    </section>
  );
}
