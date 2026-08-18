"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ts-vibe-course-progress-v1";
const EVENT_NAME = "ts-vibe-progress";

export type CourseProgress = {
  schemaVersion: 1;
  completedLessons: string[];
  completedLabs: string[];
  lastLesson?: string;
};

const emptyProgress: CourseProgress = {
  schemaVersion: 1,
  completedLessons: [],
  completedLabs: [],
};

function normalize(value: unknown): CourseProgress {
  if (!value || typeof value !== "object") return emptyProgress;
  const candidate = value as Partial<CourseProgress>;
  if (candidate.schemaVersion !== 1) return emptyProgress;
  return {
    schemaVersion: 1,
    completedLessons: Array.isArray(candidate.completedLessons)
      ? candidate.completedLessons.filter((item): item is string => typeof item === "string")
      : [],
    completedLabs: Array.isArray(candidate.completedLabs)
      ? candidate.completedLabs.filter((item): item is string => typeof item === "string")
      : [],
    lastLesson: typeof candidate.lastLesson === "string" ? candidate.lastLesson : undefined,
  };
}

export function readProgress(): CourseProgress {
  if (typeof window === "undefined") return emptyProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : emptyProgress;
  } catch {
    return emptyProgress;
  }
}

function writeProgress(progress: CourseProgress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useCourseProgress() {
  const [progress, setProgress] = useState<CourseProgress>(emptyProgress);

  useEffect(() => {
    const sync = () => setProgress(readProgress());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  const markLesson = useCallback((lessonId: string, completed: boolean) => {
    const current = readProgress();
    const completedLessons = new Set(current.completedLessons);
    if (completed) completedLessons.add(lessonId);
    else completedLessons.delete(lessonId);
    writeProgress({
      ...current,
      completedLessons: [...completedLessons],
      lastLesson: lessonId,
    });
  }, []);

  const markLab = useCallback((labId: string) => {
    const current = readProgress();
    writeProgress({
      ...current,
      completedLabs: [...new Set([...current.completedLabs, labId])],
    });
  }, []);

  const rememberLesson = useCallback((lessonId: string) => {
    const current = readProgress();
    if (current.lastLesson !== lessonId) writeProgress({ ...current, lastLesson: lessonId });
  }, []);

  return { progress, markLesson, markLab, rememberLesson };
}
