"use client";

import { SendHorizonal } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/Button";

export function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 border border-ink/30 bg-surface p-2 focus-within:border-accent">
      <label htmlFor="question" className="sr-only">
        Ask a question about your data
      </label>
      <textarea
        id="question"
        ref={ref}
        rows={1}
        value={text}
        maxLength={2000}
        placeholder="Ask about your data, e.g. “Revenue by category over the last 6 months”"
        className="max-h-40 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted"
        onChange={(e) => {
          setText(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={onKeyDown}
      />
      <Button onClick={submit} disabled={disabled || !text.trim()} aria-label="Send question">
        <SendHorizonal className="h-4 w-4" aria-hidden />
        Ask
      </Button>
    </div>
  );
}
