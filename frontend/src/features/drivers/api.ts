import { apiClient } from "@/lib/api-client";
import type { ListParams, Page } from "@/lib/types";
import type { DriverRead, DriverUpdate } from "@/features/drivers/types";

export interface DriverListParams extends ListParams {
  status?: string;
  region?: string;
}

export const driversApi = {
  list: async (params: DriverListParams): Promise<Page<DriverRead>> => {
    const { data } = await apiClient.get<Page<DriverRead>>("/drivers", { params });
    return data;
  },

  get: async (id: number): Promise<DriverRead> => {
    const { data } = await apiClient.get<DriverRead>(`/drivers/${id}`);
    return data;
  },

  update: async (id: number, payload: DriverUpdate): Promise<DriverRead> => {
    const { data } = await apiClient.patch<DriverRead>(`/drivers/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/drivers/${id}`);
  },
  expiring: async (days = 30): Promise<DriverRead[]> => {
    const { data } = await apiClient.get<DriverRead[]>(`/drivers/expiring-licenses`, {
      params: { days },
    });
    return data;
  },

  dispatchable: async (): Promise<DriverRead[]> => {
    const { data } = await apiClient.get<DriverRead[]>("/drivers/dispatchable");
    return data;
  },
};
