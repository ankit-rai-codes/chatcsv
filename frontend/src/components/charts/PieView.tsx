"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { TOOLTIP_STYLE, colorAt } from "@/components/charts/chart-theme";
import { formatNumber } from "@/lib/format";
import type { ChartPayload } from "@/types/api";

export function PieView({ chart }: { chart: ChartPayload }) {
  const valueKey = chart.series[0]?.key ?? "";
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie data={chart.data} dataKey={valueKey} nameKey={chart.x_key} innerRadius={60} outerRadius={110} paddingAngle={1} stroke="#fff">
          {chart.data.map((_, i) => (
            <Cell key={i} fill={colorAt(i)} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => formatNumber(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
