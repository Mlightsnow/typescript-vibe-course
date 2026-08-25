"use client";

import { useEffect } from "react";
import { Check, Circle } from "lucide-react";
import { useCourseProgress } from "@/lib/progress";
import { usePreferences } from "@/lib/preferences";

export function ProgressButton({ lessonId }: { lessonId: string }) {
  const { progress, markLesson, rememberLesson } = useCourseProgress();
  const completed = progress.completedLessons.includes(lessonId);
  const { locale } = usePreferences();

  useEffect(() => rememberLesson(lessonId), [lessonId, rememberLesson]);

  return (
    <button
      type="button"
      className={`complete-button ${completed ? "is-complete" : ""}`}
      onClick={() => markLesson(lessonId, !completed)}
    >
      {completed ? <Check size={17} strokeWidth={3} /> : <Circle size={17} />}
      {completed ? (locale === "en" ? "Lesson complete" : "本章已完成") : (locale === "en" ? "Mark lesson complete" : "标记本章完成")}
    </button>
  );
}
