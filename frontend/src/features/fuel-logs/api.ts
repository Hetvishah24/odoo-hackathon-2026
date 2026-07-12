import { apiClient } from "@/lib/api-client";
import type { Page } from "@/lib/types";
import type {
  FuelLogCreate,
  FuelLogListParams,
  FuelLogRead,
  FuelLogUpdate,
} from "@/features/fuel-logs/types";

export const fuelLogsApi = {
  list: async (params: FuelLogListParams): Promise<Page<FuelLogRead>> => {
    const { data } = await apiClient.get<Page<FuelLogRead>>("/fuel-logs", { params });
    return data;
  },

  create: async (payload: FuelLogCreate): Promise<FuelLogRead> => {
    const { data } = await apiClient.post<FuelLogRead>("/fuel-logs", payload);
    return data;
  },

  update: async (id: number, payload: FuelLogUpdate): Promise<FuelLogRead> => {
    const { data } = await apiClient.patch<FuelLogRead>(`/fuel-logs/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/fuel-logs/${id}`);
  },
};
