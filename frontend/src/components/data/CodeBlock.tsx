"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="relative">
      <pre className="max-h-64 overflow-auto rounded-md bg-ink p-3 pr-16 font-mono text-xs leading-relaxed text-paper">
        <code>{code}</code>
      </pre>
      <Button variant="ghost" size="sm" onClick={copy} className="absolute right-1.5 top-1.5 !text-paper/70 hover:!text-paper">
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
        <span className="sr-only">Copy SQL</span>
      </Button>
    </div>
  );
}
