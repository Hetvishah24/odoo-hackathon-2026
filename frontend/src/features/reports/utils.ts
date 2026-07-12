"use client";

import type { ReportType } from "@/features/reports/types";

export const reportTabs: { value: ReportType; label: string }[] = [
  { value: "fuel-efficiency", label: "Fuel Efficiency" },
  { value: "utilization", label: "Fleet Utilization" },
  { value: "cost", label: "Operational Cost" },
  { value: "roi", label: "Vehicle ROI" },
];

// vehicle_id -> registration number lookup now lives in features/vehicles/utils.ts (Maintenance
// needs the exact same join) - re-exported here so existing report components keep working.
export { useVehicleLookup, vehicleLabel } from "@/features/vehicles/utils";
