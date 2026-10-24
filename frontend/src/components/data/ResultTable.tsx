import { formatCell } from "@/lib/format";
import type { ResultTableData } from "@/types/api";

export function ResultTable({ table }: { table: ResultTableData }) {
  return (
    <div>
      <div className="max-h-72 overflow-auto rounded-md border border-rule bg-surface">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-surface shadow-[0_1px_0_rgb(var(--rule))]">
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i} className="border-t border-rule/60">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`whitespace-nowrap px-3 py-1.5 ${typeof cell === "number" ? "text-right tabular-nums" : ""}`}
                  >
                    {formatCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.truncated && (
        <p className="mt-1.5 text-xs text-muted">Showing the first {table.rows.length} rows.</p>
      )}
    </div>
  );
}
