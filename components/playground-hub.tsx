"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { labList } from "@/lib/course";
import { TsPlayground } from "@/components/ts-playground";

export function PlaygroundHub() {
  const [activeId, setActiveId] = useState(labList[0].id);
  const active = labList.find((lab) => lab.id === activeId) ?? labList[0];

  return (
    <main className="wide-page">
      <header className="page-heading compact-heading">
        <span className="block-eyebrow static-text"><FlaskConical size={15} /> Browser Lab</span>
        <h1>TypeScript Playground</h1>
        <p>类型诊断与运行时输出并排出现。这里没有 Node API，也不会连接外部模型。</p>
      </header>
      <div className="lab-tabs" role="tablist" aria-label="选择实验">
        {labList.map((lab) => (
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
