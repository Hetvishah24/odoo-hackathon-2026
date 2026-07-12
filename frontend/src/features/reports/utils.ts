"use client";

import * as React from "react";

import { useVehicles } from "@/features/vehicles/hooks";
import type { ReportType } from "@/features/reports/types";

export const reportTabs: { value: ReportType; label: string }[] = [
  { value: "fuel-efficiency", label: "Fuel Efficiency" },
  { value: "utilization", label: "Fleet Utilization" },
  { value: "cost", label: "Operational Cost" },
  { value: "roi", label: "Vehicle ROI" },
];

/** vehicle_id -> "REG-NUMBER (Name/Model)" for labeling report rows/charts - the report
 * endpoints only return vehicle_id, so this is a client-side join against the vehicles list. */
export function useVehicleLookup() {
  const { data } = useVehicles({ page: 1, page_size: 100, sort_by: "registration_number" });

  return React.useMemo(() => {
    const map = new Map<number, string>();
    for (const vehicle of data?.items ?? []) {
      map.set(vehicle.id, vehicle.registration_number);
    }
    return map;
  }, [data]);
}

export function vehicleLabel(lookup: Map<number, string>, vehicleId: number): string {
  return lookup.get(vehicleId) ?? `Vehicle #${vehicleId}`;
}
