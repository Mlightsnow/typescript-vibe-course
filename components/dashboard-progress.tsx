"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { lessons } from "@/lib/course";
import { useCourseProgress } from "@/lib/progress";

export function DashboardProgress() {
  const { progress } = useCourseProgress();
  const completed = progress.completedLessons.length;
  const percent = Math.round((completed / lessons.length) * 100);
  const last = progress.lastLesson
    ? lessons.find((lesson) => lesson.id === progress.lastLesson)
    : undefined;
  const next = last ?? lessons.find((lesson) => !progress.completedLessons.includes(lesson.id)) ?? lessons[0];

  return (
    <section className="dashboard-progress-card">
      <div className="progress-ring" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}>
        <span>{percent}%</span>
      </div>
      <div>
        <span className="block-eyebrow evidence-text"><CheckCircle2 size={14} /> 本地学习进度</span>
        <h2>{completed ? `已完成 ${completed} / ${lessons.length} 章` : "从第一条运行时事实开始"}</h2>
        <p>进度只保存在当前浏览器，不需要登录。</p>
      </div>
      <Link href={`/lesson/${next.slug}`} className="primary-link">
        {progress.lastLesson ? "继续学习" : "开始 M00"} <ArrowRight size={17} />
      </Link>
    </section>
  );
}
