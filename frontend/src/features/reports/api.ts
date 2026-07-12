import axios from "axios";

import { apiClient, tokenStorage } from "@/lib/api-client";
import { API_URL } from "@/lib/config";
import type {
  FleetUtilizationResponse,
  FuelEfficiencyRow,
  OperationalCostRow,
  ReportFilters,
  ReportType,
  VehicleROIRow,
} from "@/features/reports/types";

export const reportsApi = {
  fuelEfficiency: async (params?: ReportFilters): Promise<FuelEfficiencyRow[]> => {
    const { data } = await apiClient.get<FuelEfficiencyRow[]>("/reports/fuel-efficiency", {
      params,
    });
    return data;
  },

  fleetUtilization: async (params?: ReportFilters): Promise<FleetUtilizationResponse> => {
    const { data } = await apiClient.get<FleetUtilizationResponse>("/reports/fleet-utilization", {
      params,
    });
    return data;
  },

  operationalCost: async (params?: ReportFilters): Promise<OperationalCostRow[]> => {
    const { data } = await apiClient.get<OperationalCostRow[]>("/reports/operational-cost", {
      params,
    });
    return data;
  },

  vehicleRoi: async (params?: ReportFilters): Promise<VehicleROIRow[]> => {
    const { data } = await apiClient.get<VehicleROIRow[]>("/reports/vehicle-roi", {
      params: params?.vehicle_id ? { vehicle_id: params.vehicle_id } : undefined,
    });
    return data;
  },

  // The CSV endpoint returns a raw file body, not the {success, message, data} envelope
  // every other endpoint uses - `apiClient`'s response interceptor would try to unwrap a
  // Blob as if it were that envelope and break it, so this bypasses `apiClient` entirely
  // and talks to the API directly (same pattern api-client.ts's own token-refresh uses).
  exportCsv: async (type: ReportType, params?: ReportFilters): Promise<Blob> => {
    const token = tokenStorage.getAccess();
    const response = await axios.get(`${API_URL}/reports/export.csv`, {
      params: { type, ...params },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
