import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Shared across Dashboard's financial_overview and the Reports page so the same
 * number never renders two different ways (see 09_REPORTS.md's consistency note). */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Green for profitable, red for loss-making - shared "good vs bad" ROI convention. */
export function getRoiColorClass(roiPct: number | null): string {
  if (roiPct === null) return "text-muted-foreground";
  return roiPct >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
}
