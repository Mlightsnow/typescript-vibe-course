import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson-view";
import { lessonBySlug, lessons } from "@/lib/course";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = lessonBySlug.get(slug);
  if (!lesson) return {};
  return { title: `${lesson.id} · ${lesson.title}`, description: lesson.summary };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = lessonBySlug.get(slug);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
