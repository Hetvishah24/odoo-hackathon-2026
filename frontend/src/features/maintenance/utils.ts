import type { MaintenanceStatus } from "@/features/maintenance/types";

export const maintenanceStatuses: MaintenanceStatus[] = ["open", "closed"];

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  open: "Open",
  closed: "Closed",
};

// Same amber/green shades as VehicleStatus's in_shop/available badges (features/vehicles/utils.ts)
// - an open maintenance row and an in_shop vehicle should read as "the same story" per
// 04_MAINTENANCE.md's UX guidance.
export const maintenanceStatusStyles: Record<MaintenanceStatus, string> = {
  open: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  closed: "border-transparent bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
};
