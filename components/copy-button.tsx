"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="copy-button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      aria-label="复制代码"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? "已复制" : "复制"}
    </button>
  );
}
