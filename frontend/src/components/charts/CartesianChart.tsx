"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AXIS_STYLE, GRID_STROKE, TOOLTIP_STYLE, colorAt } from "@/components/charts/chart-theme";
import { formatCompact, formatNumber, formatXTick } from "@/lib/format";
import type { ChartPayload } from "@/types/api";

type Radius = [number, number, number, number];
const ROUND_TOP: Radius = [3, 3, 0, 0];
const ROUND_RIGHT: Radius = [0, 3, 3, 0];

/** Handles bar, line and area charts, including multi-series and stacked variants. */
export function CartesianChart({ chart }: { chart: ChartPayload }) {
  const { type, data, series, x_key: xKey, x_is_time: isTime, stacked } = chart;
  const horizontal = type === "bar" && !isTime && data.length > 6;
  const height = horizontal ? Math.max(260, data.length * 30 + 60) : 320;
  const stackId = stacked ? "stack" : undefined;
  const legend = series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null;
  const tooltip = (
    <Tooltip
      contentStyle={TOOLTIP_STYLE}
      formatter={(value: unknown, name: unknown) => [formatNumber(value), String(name)] as [string, string]}
      labelFormatter={(label: unknown) => formatXTick(label as string | number, isTime)}
    />
  );
  const xTick = (v: string | number) => formatXTick(v, isTime);
  const margin = { top: 8, right: 16, bottom: 4, left: 4 };

  let body: JSX.Element;
  if (type === "line") {
    body = (
      <LineChart data={data} margin={margin}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} tickFormatter={xTick} minTickGap={24} />
        <YAxis tick={AXIS_STYLE} tickFormatter={formatCompact} width={56} />
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Line key={s.key} dataKey={s.key} name={s.label} stroke={colorAt(i)} strokeWidth={2} dot={data.length < 30} connectNulls />
        ))}
      </LineChart>
    );
  } else if (type === "area") {
    body = (
      <AreaChart data={data} margin={margin}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} tickFormatter={xTick} minTickGap={24} />
        <YAxis tick={AXIS_STYLE} tickFormatter={formatCompact} width={56} />
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Area key={s.key} dataKey={s.key} name={s.label} stroke={colorAt(i)} fill={colorAt(i)} fillOpacity={0.18} strokeWidth={2} stackId={stackId} connectNulls />
        ))}
      </AreaChart>
    );
  } else if (horizontal) {
    body = (
      <BarChart data={data} layout="vertical" margin={{ ...margin, left: 8 }}>
        <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
        <XAxis type="number" tick={AXIS_STYLE} tickFormatter={formatCompact} />
        <YAxis type="category" dataKey={xKey} tick={AXIS_STYLE} tickFormatter={xTick} width={120} interval={0} />
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={colorAt(i)} stackId={stackId} radius={stacked ? 0 : ROUND_RIGHT} />
        ))}
      </BarChart>
    );
  } else {
    body = (
      <BarChart data={data} margin={margin}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} tickFormatter={xTick} interval="preserveStartEnd" minTickGap={12} />
        <YAxis tick={AXIS_STYLE} tickFormatter={formatCompact} width={56} />
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={colorAt(i)} stackId={stackId} radius={stacked ? 0 : ROUND_TOP} />
        ))}
      </BarChart>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {body}
    </ResponsiveContainer>
  );
}
