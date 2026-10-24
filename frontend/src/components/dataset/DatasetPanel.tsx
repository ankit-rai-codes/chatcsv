"use client";

import { AlertTriangle, Link2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatBytes, formatNumber, plural } from "@/lib/format";
import type { DatasetRecord, TableProfile } from "@/types/api";

export function DatasetPanel({ dataset, onReplace }: { dataset: DatasetRecord; onReplace: () => void }) {
  const profile = dataset.profile;
  const processing = dataset.status === "processing";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {processing ? "Preparing your data" : dataset.status === "failed" ? "Processing failed" : `${plural(profile?.tables.length ?? 0, "table")} ready`}
        </h2>
        <Button variant="ghost" size="sm" onClick={onReplace}>
          Replace files
        </Button>
      </div>

      {processing && (
        <div
          className="h-1 w-full overflow-hidden bg-rule"
          role="progressbar"
          aria-valuenow={Math.round(dataset.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Processing progress"
        >
          <div className="h-full bg-accent transition-all" style={{ width: `${Math.max(dataset.progress * 100, 6)}%` }} />
        </div>
      )}

      {dataset.error && <p className="text-sm text-danger">{dataset.error}</p>}

      <ul className="divide-y divide-rule border border-rule bg-surface">
        {dataset.files.map((file) => {
          const table = profile?.tables.find((t) => t.name === file.table_name);
          return (
            <li key={file.table_name} className="px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium">{file.filename}</span>
                <StatusDot status={file.status} />
              </div>
              <p className="text-xs text-muted">
                {table ? `${plural(table.row_count, "row")}, ${plural(table.column_count, "column")}` : formatBytes(file.size_bytes)}
              </p>
              {file.error && <p className="mt-1 text-xs text-danger">{file.error}</p>}
              {table && <TableDetails table={table} />}
            </li>
          );
        })}
      </ul>

      {profile && profile.relationships.length > 0 && (
        <section aria-label="Detected links between files">
          <h3 className="mb-1.5 text-xs font-semibold text-muted">Links found between files</h3>
          <ul className="space-y-1 text-xs">
            {profile.relationships.map((r) => (
              <li key={`${r.from_table}.${r.from_column}`} className="flex items-center gap-1.5">
                <Link2 className="h-3 w-3 shrink-0 text-accent" aria-hidden />
                <span className="truncate">
                  {r.from_table}.{r.from_column} → {r.to_table}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function TableDetails({ table }: { table: TableProfile }) {
  const c = table.cleaning;
  const notes = [
    c.duplicate_rows_removed > 0 && `${plural(c.duplicate_rows_removed, "duplicate row")} removed`,
    c.empty_rows_removed > 0 && `${plural(c.empty_rows_removed, "empty row")} removed`,
    c.dropped_columns.length > 0 && `${plural(c.dropped_columns.length, "empty column")} dropped`,
  ].filter(Boolean) as string[];
  const missing = table.columns.filter((col) => col.null_pct > 0).length;
  const outliers = table.columns.filter((col) => (col.outlier_count ?? 0) > 0).length;

  return (
    <Disclosure summary="Columns and data quality">
      {(notes.length > 0 || missing > 0 || outliers > 0) && (
        <p className="mb-2 flex items-start gap-1.5 text-xs text-muted">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warn" aria-hidden />
          <span>
            {[...notes, missing > 0 && `${plural(missing, "column")} with missing values`, outliers > 0 && `${plural(outliers, "column")} with outliers (kept)`]
              .filter(Boolean)
              .join(", ")}
            .
          </span>
        </p>
      )}
      <ul className="space-y-0.5 text-xs">
        {table.columns.map((col) => (
          <li key={col.name} className="flex justify-between gap-2">
            <span className="truncate font-medium">
              {col.name}
              {table.primary_key === col.name && <span className="ml-1 font-normal text-accent">key</span>}
            </span>
            <span className="shrink-0 text-muted">
              {col.kind}
              {col.null_pct > 0 && `, ${formatNumber(col.null_pct)}% empty`}
            </span>
          </li>
        ))}
      </ul>
    </Disclosure>
  );
}
