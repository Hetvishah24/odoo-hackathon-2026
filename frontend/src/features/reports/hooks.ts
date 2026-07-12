"use client";

import { useQuery } from "@tanstack/react-query";

import { reportsApi } from "@/features/reports/api";
import type { FleetUtilizationResponse, FuelEfficiencyRow } from "@/features/reports/types";

const REPORTS_KEY = "reports";

export function useFuelEfficiencyReport(params?: Record<string, unknown>) {
  return useQuery<FuelEfficiencyRow[]>({
    queryKey: [REPORTS_KEY, "fuel-efficiency", params],
    queryFn: () => reportsApi.fuelEfficiency(params),
  });
}

export function useFleetUtilizationReport(params?: Record<string, unknown>) {
  return useQuery<FleetUtilizationResponse>({
    queryKey: [REPORTS_KEY, "fleet-utilization", params],
    queryFn: () => reportsApi.fleetUtilization(params),
  });
}
