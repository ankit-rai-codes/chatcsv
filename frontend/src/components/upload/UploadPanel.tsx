"use client";

import { FileText, X } from "lucide-react";
import { useState } from "react";

import { FileDropzone } from "@/components/upload/FileDropzone";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { MAX_FILES } from "@/lib/config";
import { formatBytes, plural } from "@/lib/format";

interface Props {
  onUpload: (files: File[]) => void;
  onUseSample: () => void;
  busy: boolean;
  error?: string;
}

export function UploadPanel({ onUpload, onUseSample, busy, error }: Props) {
  const [staged, setStaged] = useState<File[]>([]);

  const add = (files: File[]) =>
    setStaged((current) => {
      const names = new Set(current.map((f) => f.name));
      return [...current, ...files.filter((f) => !names.has(f.name))].slice(0, MAX_FILES);
    });

  return (
    <div className="space-y-3">
      <FileDropzone onFiles={add} disabled={busy} />

      {staged.length > 0 && (
        <ul className="divide-y divide-rule border border-rule bg-surface text-sm">
          {staged.map((file) => (
            <li key={file.name} className="flex items-center gap-2 px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => setStaged((s) => s.filter((f) => f !== file))}
                className="rounded p-0.5 text-muted hover:text-danger"
                aria-label={`Remove ${file.name}`}
                disabled={busy}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button disabled={busy || staged.length === 0} onClick={() => onUpload(staged)}>
          {busy ? <Spinner label="Uploading" /> : staged.length ? `Analyze ${plural(staged.length, "file")}` : "Analyze files"}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={onUseSample}>
          Try the sample online shop
        </Button>
      </div>
    </div>
  );
}
