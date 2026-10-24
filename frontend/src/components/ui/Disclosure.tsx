import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** Native <details>: keyboard accessible and animation-free by default. */
export function Disclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return (
    <details className="group border-t border-rule">
      <summary className="flex items-center gap-1.5 py-2 text-xs font-medium text-muted hover:text-ink">
        <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" aria-hidden />
        {summary}
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  );
}
