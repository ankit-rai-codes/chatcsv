"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { CodeBlock } from "@/components/data/CodeBlock";
import { ResultTable } from "@/components/data/ResultTable";
import { Disclosure } from "@/components/ui/Disclosure";
import { Spinner } from "@/components/ui/Spinner";
import type { Turn } from "@/hooks/useChat";
import { formatDuration, plural } from "@/lib/format";

interface Props {
  turn: Turn;
  isLatest: boolean;
  onFollowUp: (question: string) => void;
  busy: boolean;
}

/** One analysis "cell": the question, then what we found. */
export function TurnView({ turn, isLatest, onFollowUp, busy }: Props) {
  const res = turn.response;
  return (
    <article className="border-l-4 border-accent pl-5">
      <h3 className="text-lg font-semibold leading-snug">{turn.question}</h3>

      {turn.status === "pending" && (
        <p className="mt-3 text-sm text-muted">
          <Spinner label="Writing the query and checking the numbers" />
        </p>
      )}

      {turn.status === "error" && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {turn.error}
        </p>
      )}

      {res && (
        <div className="mt-3 space-y-4">
          <div className="answer-prose text-[15px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{res.answer}</ReactMarkdown>
          </div>

          {res.chart && <ChartRenderer chart={res.chart} />}

          {res.assumptions.length > 0 && (
            <p className="text-xs text-muted">
              <span className="font-semibold">Assumed:</span> {res.assumptions.join("; ")}
            </p>
          )}

          {(res.table || res.sql) && (
            <div className="border-b border-rule">
              {res.table && res.table.total_rows > 0 && (
                <Disclosure summary={`View data (${plural(res.table.total_rows, "row")})`}>
                  <ResultTable table={res.table} />
                </Disclosure>
              )}
              {res.sql && (
                <Disclosure summary="View SQL">
                  <CodeBlock code={res.sql} />
                </Disclosure>
              )}
            </div>
          )}

          <p className="text-xs text-muted">
            Answered in {formatDuration(res.meta.elapsed_ms)}
            {res.meta.sql_attempts > 1 && `, after ${res.meta.sql_attempts} query attempts`}
            {res.meta.cached && ", from cache"}.
          </p>

          {isLatest && <SuggestionChips items={res.followups} onPick={onFollowUp} disabled={busy} />}
        </div>
      )}
    </article>
  );
}
