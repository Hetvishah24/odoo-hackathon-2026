import { apiClient } from "@/lib/api-client";
import type { ListParams, Page } from "@/lib/types";
import type { MaintenanceCreate, MaintenanceRead, MaintenanceUpdate } from "@/features/maintenance/types";

export interface MaintenanceListParams extends ListParams {
  status?: string;
  vehicle_id?: number;
}

export const maintenanceApi = {
  list: async (params: MaintenanceListParams): Promise<Page<MaintenanceRead>> => {
    const { data } = await apiClient.get<Page<MaintenanceRead>>("/maintenance", { params });
    return data;
  },

  open: async (payload: MaintenanceCreate): Promise<MaintenanceRead> => {
    const { data } = await apiClient.post<MaintenanceRead>("/maintenance", payload);
    return data;
  },

  close: async (id: number): Promise<MaintenanceRead> => {
    const { data } = await apiClient.post<MaintenanceRead>(`/maintenance/${id}/close`);
    return data;
  },

  update: async (id: number, payload: MaintenanceUpdate): Promise<MaintenanceRead> => {
    const { data } = await apiClient.patch<MaintenanceRead>(`/maintenance/${id}`, payload);
    return data;
  },
};
