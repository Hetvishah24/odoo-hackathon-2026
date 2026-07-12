import { apiClient } from "@/lib/api-client";
import type { ListParams, Page } from "@/lib/types";
import type { DriverCreate, DriverRead, DriverUpdate } from "@/features/drivers/types";

export interface DriverListParams extends ListParams {
  status?: string;
  region?: string;
}

export const driversApi = {
  list: async (params: DriverListParams): Promise<Page<DriverRead>> => {
    const { data } = await apiClient.get<Page<DriverRead>>("/drivers", { params });
    return data;
  },

  create: async (payload: DriverCreate): Promise<DriverRead> => {
    const { data } = await apiClient.post<DriverRead>("/drivers", payload);
    return data;
  },

  update: async (id: number, payload: DriverUpdate): Promise<DriverRead> => {
    const { data } = await apiClient.patch<DriverRead>(`/drivers/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/drivers/${id}`);
  },
};
