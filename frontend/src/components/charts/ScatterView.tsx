"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, Legend } from "recharts";

import { AXIS_STYLE, GRID_STROKE, TOOLTIP_STYLE, colorAt } from "@/components/charts/chart-theme";
import { formatCompact, formatNumber } from "@/lib/format";
import type { ChartPayload } from "@/types/api";

export function ScatterView({ chart }: { chart: ChartPayload }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
        <CartesianGrid stroke={GRID_STROKE} />
        <XAxis type="number" dataKey="x" name={chart.x_label ?? chart.x_key} tick={AXIS_STYLE} tickFormatter={formatCompact} />
        <YAxis type="number" dataKey="y" name={chart.y_label ?? "value"} tick={AXIS_STYLE} tickFormatter={formatCompact} width={56} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} formatter={(v: unknown) => formatNumber(v)} />
        {chart.series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {chart.series.map((s, i) => (
          <Scatter
            key={s.key}
            name={s.label}
            fill={colorAt(i)}
            data={chart.data
              .filter((d) => d[s.key] !== null && d[s.key] !== undefined)
              .map((d) => ({ x: d[chart.x_key], y: d[s.key] }))}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
