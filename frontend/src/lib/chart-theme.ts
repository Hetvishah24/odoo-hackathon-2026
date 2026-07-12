import type { CSSProperties } from "react";

/** Shared recharts <Tooltip> theming - without this, recharts renders a hardcoded white
 * box regardless of the app's theme, which reads as a bug in dark mode. Uses the same
 * `hsl(var(--x))` pattern as the chart fills in each feature's utils.ts, since these CSS
 * vars store raw HSL components, not full color values. */
export const chartTooltipContentStyle: CSSProperties = {
  backgroundColor: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  fontSize: "0.875rem",
  boxShadow: "0 4px 12px hsl(var(--foreground) / 0.08)",
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: "hsl(var(--popover-foreground))",
  fontWeight: 500,
};

export const chartTooltipItemStyle: CSSProperties = {
  color: "hsl(var(--popover-foreground))",
};

/** Fixed, theme-stable data-series colors for chart fills (bars/lines/slices).
 *
 * Don't use `hsl(var(--primary))` here: shadcn's dark theme inverts --primary to near-white
 * (0 0% 98%) for button contrast, so a bar using it renders white-on-white-ish in dark mode
 * and the data effectively disappears. These are fixed hex values instead, so a series reads
 * the same color in both themes. */
export const CHART_BLUE = "#3b82f6";
export const CHART_SLATE = "#64748b";

// Axis ticks/legend default to recharts' hardcoded '#666'/'#000' otherwise, which reads
// poorly (sometimes near-invisible) against a dark card background.
export const chartAxisTickStyle = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
export const chartLegendTextStyle: CSSProperties = { color: "hsl(var(--muted-foreground))" };
