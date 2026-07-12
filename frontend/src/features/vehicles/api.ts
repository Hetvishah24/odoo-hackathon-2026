import { apiClient } from "@/lib/api-client";
import type { ListParams, Page } from "@/lib/types";
import type { VehicleCreate, VehicleRead, VehicleUpdate } from "@/features/vehicles/types";

export interface VehicleListParams extends ListParams {
  status?: string;
  type?: string;
  region?: string;
}

export const vehiclesApi = {
  list: async (params: VehicleListParams): Promise<Page<VehicleRead>> => {
    const { data } = await apiClient.get<Page<VehicleRead>>("/vehicles", { params });
    return data;
  },

  dispatchable: async (): Promise<VehicleRead[]> => {
    const { data } = await apiClient.get<VehicleRead[]>("/vehicles/dispatchable");
    return data;
  },

  create: async (payload: VehicleCreate): Promise<VehicleRead> => {
    const { data } = await apiClient.post<VehicleRead>("/vehicles", payload);
    return data;
  },

  update: async (id: number, payload: VehicleUpdate): Promise<VehicleRead> => {
    const { data } = await apiClient.patch<VehicleRead>(`/vehicles/${id}`, payload);
    return data;
  },

  retire: async (id: number): Promise<VehicleRead> => {
    const { data } = await apiClient.delete<VehicleRead>(`/vehicles/${id}`);
    return data;
  },
};
