"use client";

import { CartesianChart } from "@/components/charts/CartesianChart";
import { PieView } from "@/components/charts/PieView";
import { ScatterView } from "@/components/charts/ScatterView";
import type { ChartPayload } from "@/types/api";

/** Single entry point: pass any backend ChartPayload, get a chart on drafting-grid paper. */
export function ChartRenderer({ chart }: { chart: ChartPayload }) {
  return (
    <figure className="overflow-hidden border border-rule">
      {chart.title && (
        <figcaption className="border-b border-rule bg-surface px-4 py-2.5 text-sm font-semibold">{chart.title}</figcaption>
      )}
      <div className="chart-grid px-2 py-3" role="img" aria-label={chart.title ?? `${chart.type} chart`}>
        {chart.type === "pie" ? <PieView chart={chart} /> : chart.type === "scatter" ? <ScatterView chart={chart} /> : <CartesianChart chart={chart} />}
      </div>
      {(chart.y_label || chart.truncated) && (
        <p className="border-t border-rule bg-surface px-4 py-1.5 text-xs text-muted">
          {chart.y_label && <span>{chart.y_label} by {chart.x_label?.toLowerCase() ?? chart.x_key}</span>}
          {chart.truncated && <span>. Showing a subset of the data.</span>}
        </p>
      )}
    </figure>
  );
}
