"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { AlertTriangle, CheckCircle2, Play, RotateCcw, SquareTerminal } from "lucide-react";
import type { Lab } from "@/lib/course";
import { useCourseProgress } from "@/lib/progress";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="editor-loading">正在加载 TypeScript 编辑器…</div>,
});

type MonacoApi = Parameters<OnMount>[1];
type DiagnosticMessageChain = {
  messageText: string;
  next?: DiagnosticMessageChain[];
};
type WorkerDiagnostic = {
  start?: number;
  messageText: string | DiagnosticMessageChain;
};

function flattenMessage(message: WorkerDiagnostic["messageText"]): string {
  if (typeof message === "string") return message;
    const children =
      message.next?.map((child: DiagnosticMessageChain) =>
        flattenMessage(child.messageText),
      ) ?? [];
  return [message.messageText, ...children].join(" → ");
}

function executeInWorker(code: string, timeoutMs = 2000) {
  return new Promise<string[]>((resolve, reject) => {
    const workerSource = `
      const serialize = (value) => {
        if (typeof value === "string") return value;
        try { return JSON.stringify(value); } catch { return String(value); }
      };
      self.onmessage = async (event) => {
        const logs = [];
        const capture = {
          log: (...args) => logs.push(args.map(serialize).join(" ")),
          warn: (...args) => logs.push("WARN " + args.map(serialize).join(" ")),
          error: (...args) => logs.push("ERROR " + args.map(serialize).join(" ")),
        };
        try {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          await new AsyncFunction("console", event.data.code)(capture);
          await new Promise((done) => setTimeout(done, 40));
          self.postMessage({ ok: true, logs });
        } catch (error) {
          self.postMessage({ ok: false, logs, error: error instanceof Error ? error.message : String(error) });
        }
      };
    `;
    const blobUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(blobUrl);
    const timeout = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      reject(new Error(`执行超过 ${timeoutMs}ms，已终止 Worker。`));
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<{ ok: boolean; logs: string[]; error?: string }>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      if (event.data.ok) resolve(event.data.logs);
      else reject(Object.assign(new Error(event.data.error ?? "未知运行时错误"), { logs: event.data.logs }));
    };
    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      reject(new Error(event.message));
    };
    worker.postMessage({ code });
  });
}

export function TsPlayground({ lab, fullPage = false }: { lab: Lab; fullPage?: boolean }) {
  const draftKey = `ts-vibe-lab-${lab.id}`;
  const [code, setCode] = useState(lab.initialCode);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [compact, setCompact] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<MonacoApi | null>(null);
  const { markLab } = useCourseProgress();

  useEffect(() => {
    const saved = window.localStorage.getItem(draftKey);
    const media = window.matchMedia("(max-width: 720px)");
    const sync = () => setCompact(media.matches);
    const frame = window.requestAnimationFrame(() => {
      if (saved) setCode(saved);
      sync();
    });
    media.addEventListener("change", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
    };
  }, [draftKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => window.localStorage.setItem(draftKey, code), 250);
    return () => window.clearTimeout(timer);
  }, [code, draftKey]);

  const handleMount: OnMount = useCallback((mountedEditor, monaco) => {
    editorRef.current = mountedEditor;
    monacoRef.current = monaco;
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2022,
      module: monaco.languages.typescript.ModuleKind.None,
      strict: true,
      noEmitOnError: false,
      allowNonTsExtensions: true,
    });
    mountedEditor.focus();
  }, []);

  const run = useCallback(async () => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) return;
    setStatus("running");
    setOutput([]);
    try {
      const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
      const client = await getWorker(model.uri);
      const [syntactic, semantic, emit] = await Promise.all([
        client.getSyntacticDiagnostics(model.uri.toString()),
        client.getSemanticDiagnostics(model.uri.toString()),
        client.getEmitOutput(model.uri.toString()),
      ]);
      const allDiagnostics = ([...syntactic, ...semantic] as WorkerDiagnostic[]).map((item) => {
        const position = model.getPositionAt(item.start ?? 0);
        return `L${position.lineNumber}:${position.column} · ${flattenMessage(item.messageText)}`;
      });
      setDiagnostics(allDiagnostics);
      const js = emit.outputFiles.find(
        (file: { name: string; text: string }) => file.name.endsWith(".js"),
      )?.text;
      if (!js) throw new Error("TypeScript 没有生成可执行 JavaScript。" );
      const logs = await executeInWorker(js);
      setOutput(logs.length ? logs : ["程序执行完成，没有控制台输出。"]);
      setStatus("passed");
      markLab(lab.id);
    } catch (error) {
      const details = error as Error & { logs?: string[] };
      setOutput([...(details.logs ?? []), `运行时错误 · ${details.message}`]);
      setStatus("failed");
    }
  }, [lab.id, markLab]);

  const reset = () => {
    setCode(lab.initialCode);
    setDiagnostics([]);
    setOutput([]);
    setStatus("idle");
    window.localStorage.removeItem(draftKey);
  };

  return (
    <section className={`playground-card ${fullPage ? "is-full-page" : ""}`} aria-label={lab.title}>
      <header className="playground-header">
        <div>
          <span className="block-eyebrow static-text"><SquareTerminal size={14} /> TypeScript Lab</span>
          <h3>{lab.title}</h3>
          <p>{lab.prompt}</p>
        </div>
        <div className="playground-actions">
          <button type="button" className="secondary-button" onClick={reset}>
            <RotateCcw size={15} /> 重置
          </button>
          {!compact && (
            <button type="button" className="run-button" onClick={run} disabled={status === "running"}>
              <Play size={15} fill="currentColor" /> {status === "running" ? "运行中…" : "类型检查并运行"}
            </button>
          )}
        </div>
      </header>

      {compact ? (
        <div className="mobile-editor-fallback">
          <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} />
          <p>移动端可编辑和复制草稿；类型诊断与运行请在桌面浏览器完成。</p>
        </div>
      ) : (
        <div className="editor-frame">
          <MonacoEditor
            height={fullPage ? "58vh" : "360px"}
            language="typescript"
            path={`/${lab.id}.ts`}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            onMount={handleMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              tabSize: 2,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
            }}
          />
        </div>
      )}

      {!compact && (
        <div className="playground-results">
          <div>
            <strong>类型诊断 <span>{diagnostics.length}</span></strong>
            {diagnostics.length ? (
              <ul className="diagnostic-list">
                {diagnostics.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p className="result-placeholder">{status === "idle" ? "运行后显示诊断。" : "没有类型错误。"}</p>
            )}
          </div>
          <div>
            <strong>
              运行输出
              {status === "passed" && <CheckCircle2 size={16} className="result-ok" />}
              {status === "failed" && <AlertTriangle size={16} className="result-error" />}
            </strong>
            {output.length ? (
              <pre className={status === "failed" ? "output-error" : ""}>{output.join("\n")}</pre>
            ) : (
              <p className="result-placeholder">等待执行。</p>
            )}
          </div>
        </div>
      )}
      <details className="lab-hint">
        <summary>需要提示？</summary>
        <p>{lab.hint}</p>
      </details>
    </section>
  );
}
