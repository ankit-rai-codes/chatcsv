export const CHART_COLORS = [
  "#2447F5", // cobalt (accent)
  "#E8A33D", // amber
  "#1E9E75", // green
  "#D6455D", // rose
  "#7B5CE0", // violet
  "#4C9BD6", // sky
  "#8A6F4E", // umber
  "#5E7380", // slate
] as const;

export const colorAt = (i: number): string => CHART_COLORS[i % CHART_COLORS.length];

export const AXIS_STYLE = { fontSize: 12, fill: "#5B6B75" } as const;
export const GRID_STROKE = "#D5DDE2";
export const TOOLTIP_STYLE = {
  border: "1px solid #D5DDE2",
  borderRadius: 6,
  fontSize: 12,
  boxShadow: "none",
} as const;
