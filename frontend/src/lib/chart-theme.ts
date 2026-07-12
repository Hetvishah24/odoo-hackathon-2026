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
