"use client";

import { useEffect } from "react";
import { Check, Circle } from "lucide-react";
import { useCourseProgress } from "@/lib/progress";

export function ProgressButton({ lessonId }: { lessonId: string }) {
  const { progress, markLesson, rememberLesson } = useCourseProgress();
  const completed = progress.completedLessons.includes(lessonId);

  useEffect(() => rememberLesson(lessonId), [lessonId, rememberLesson]);

  return (
    <button
      type="button"
      className={`complete-button ${completed ? "is-complete" : ""}`}
      onClick={() => markLesson(lessonId, !completed)}
    >
      {completed ? <Check size={17} strokeWidth={3} /> : <Circle size={17} />}
      {completed ? "本章已完成" : "标记本章完成"}
    </button>
  );
}
