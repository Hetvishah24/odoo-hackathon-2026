import type { DriverRead, DriverStatus } from "@/features/drivers/types";

export const DRIVER_STATUSES: { value: DriverStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "on_trip", label: "On Trip" },
  { value: "off_duty", label: "Off Duty" },
  { value: "suspended", label: "Suspended" },
];

export function formatLicenseExpiry(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

export function getDaysUntilExpiry(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((then - now) / (1000 * 60 * 60 * 24));
}

export function getExpiryTone(dateStr: string): "expired" | "warning" | "ok" {
  const days = getDaysUntilExpiry(dateStr);
  if (days < 0) return "expired";
  if (days < 30) return "warning";
  return "ok";
}

export function getExpiryClassName(dateStr: string): string {
  const tone = getExpiryTone(dateStr);
  if (tone === "expired") return "text-destructive font-medium";
  if (tone === "warning") return "text-amber-600 dark:text-amber-400 font-medium";
  return "text-foreground";
}

export function getExpiryBadge(dateStr: string): string | null {
  const days = getDaysUntilExpiry(dateStr);
  if (days < 0) return "Expired";
  if (days < 30) return `${days}d left`;
  return null;
}

export function maskContactNumber(contact: string): string {
  const digits = contact.replace(/\D/g, "");
  if (digits.length <= 5) return contact;
  return `${digits.slice(0, 5)}${"x".repeat(Math.min(5, digits.length - 5))}`;
}

export function getSafetyTone(score: number): "low" | "medium" | "high" {
  if (score < 70) return "low";
  if (score < 85) return "medium";
  return "high";
}

export function getSafetyBarClass(score: number): string {
  const tone = getSafetyTone(score);
  if (tone === "low") return "bg-destructive";
  if (tone === "medium") return "bg-amber-500";
  return "bg-emerald-500";
}

export function getStatusBadgeClass(status: DriverStatus): string {
  switch (status) {
    case "available":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    case "on_trip":
      return "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400";
    case "off_duty":
      return "border-border bg-muted text-muted-foreground";
    case "suspended":
      return "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
}

export function formatStatusLabel(status: DriverStatus): string {
  return status.replace("_", " ");
}

export function filterDrivers(
  drivers: DriverRead[],
  filters: { search?: string; status?: string; region?: string }
): DriverRead[] {
  const search = filters.search?.trim().toLowerCase();
  const region = filters.region?.trim().toLowerCase();

  return drivers.filter((driver) => {
    if (filters.status && driver.status !== filters.status) return false;
    if (region && !(driver.region ?? "").toLowerCase().includes(region)) return false;
    if (!search) return true;
    return (
      driver.name.toLowerCase().includes(search) ||
      driver.license_number.toLowerCase().includes(search)
    );
  });
}
