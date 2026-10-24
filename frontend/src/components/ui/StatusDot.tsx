import { cn } from "@/lib/cn";
import type { FileStatus } from "@/types/api";

const styles: Record<FileStatus, string> = {
  queued: "bg-muted/50",
  processing: "bg-warn animate-pulse",
  ready: "bg-ok",
  failed: "bg-danger",
};

const labels: Record<FileStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

export function StatusDot({ status }: { status: FileStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={cn("h-2 w-2 rounded-full", styles[status])} aria-hidden />
      {labels[status]}
    </span>
  );
}
