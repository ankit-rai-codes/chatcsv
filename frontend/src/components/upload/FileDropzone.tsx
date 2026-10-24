"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";

import { cn } from "@/lib/cn";

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

const isCsv = (file: File) => file.name.toLowerCase().endsWith(".csv");

export function FileDropzone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (list: FileList | null) => {
    if (!list) return;
    const csvs = Array.from(list).filter(isCsv);
    if (csvs.length) onFiles(csvs);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) accept(event.dataTransfer.files);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Add CSV files"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={onKeyDown}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 border border-dashed px-4 py-6 text-center transition-colors",
        dragging ? "border-accent bg-accent-soft" : "border-ink/30 bg-surface hover:border-accent",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <UploadCloud className="h-6 w-6 text-accent" aria-hidden />
      <p className="text-sm font-medium">Drop CSV files here</p>
      <p className="text-xs text-muted">or click to browse. Add as many as you need.</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        multiple
        hidden
        onChange={(e) => {
          accept(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
