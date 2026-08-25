"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { labList } from "@/lib/course";
import { labListEn } from "@/lib/course-en";
import { usePreferences } from "@/lib/preferences";
import { TsPlayground } from "@/components/ts-playground";

export function PlaygroundHub() {
  const { locale } = usePreferences();
  const activeLabs = locale === "en" ? labListEn : labList;
  const [activeId, setActiveId] = useState(labList[0].id);
  const active = activeLabs.find((lab) => lab.id === activeId) ?? activeLabs[0];

  return (
    <main className="wide-page">
      <header className="page-heading compact-heading">
        <span className="block-eyebrow static-text"><FlaskConical size={15} /> Browser Lab</span>
        <h1>TypeScript Playground</h1>
        <p>{locale === "en" ? "See type diagnostics beside runtime output. No Node.js APIs or external models are available here." : "类型诊断与运行时输出并排出现。这里没有 Node API，也不会连接外部模型。"}</p>
      </header>
      <div className="lab-tabs" role="tablist" aria-label="选择实验">
        {activeLabs.map((lab) => (
          <button
            key={lab.id}
            type="button"
            role="tab"
            aria-selected={lab.id === active.id}
            className={lab.id === active.id ? "is-active" : ""}
            onClick={() => setActiveId(lab.id)}
          >
            <small>{lab.lessonId}</small>
            {lab.title}
          </button>
        ))}
      </div>
      <TsPlayground key={active.id} lab={active} fullPage />
    </main>
  );
}
