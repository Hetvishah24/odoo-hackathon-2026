const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const currencyPreciseFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number, precise = false): string {
  const formatter = precise ? currencyPreciseFormatter : currencyFormatter;
  return formatter.format(value);
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatLiters(value: number): string {
  return `${value.toLocaleString("en-IN", { maximumFractionDigits: 1 })} L`;
}
