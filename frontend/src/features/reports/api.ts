import { apiClient } from "@/lib/api-client";
import type { FleetUtilizationResponse, FuelEfficiencyRow } from "@/features/reports/types";

export const reportsApi = {
  fuelEfficiency: async (params?: Record<string, unknown>): Promise<FuelEfficiencyRow[]> => {
    const { data } = await apiClient.get<FuelEfficiencyRow[]>("/reports/fuel-efficiency", {
      params,
    });
    return data;
  },

  fleetUtilization: async (params?: Record<string, unknown>): Promise<FleetUtilizationResponse> => {
    const { data } = await apiClient.get<FleetUtilizationResponse>("/reports/fleet-utilization", {
      params,
    });
    return data;
  },
};
