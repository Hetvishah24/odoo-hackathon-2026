"use client";

import * as React from "react";

import { useVehicles } from "@/features/vehicles/hooks";
import type { VehicleStatus, VehicleType } from "@/features/vehicles/types";

export const vehicleTypes: VehicleType[] = ["truck", "van", "bike", "trailer", "other"];
export const vehicleStatuses: VehicleStatus[] = ["available", "on_trip", "in_shop", "retired"];

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  available: "Available",
  on_trip: "On Trip",
  in_shop: "In Shop",
  retired: "Retired",
};

// Status is "the most visually prominent thing in each row" per 03_VEHICLES.md - distinct
// colors per status rather than the generic secondary-badge every other table uses.
export const vehicleStatusStyles: Record<VehicleStatus, string> = {
  available: "border-transparent bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  on_trip: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  in_shop: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  retired: "border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
};

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** vehicle_id -> registration number, for features that only get back a vehicle_id (Reports,
 * Maintenance) and need to join it against the vehicles list client-side to display it. */
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
