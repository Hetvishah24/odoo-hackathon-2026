import { apiClient } from "@/lib/api-client";
import type { Page } from "@/lib/types";
import type {
  TripComplete,
  TripCreate,
  TripListParams,
  TripRead,
  TripUpdate,
} from "@/features/trips/types";

export const tripsApi = {
  list: async (params: TripListParams): Promise<Page<TripRead>> => {
    const { data } = await apiClient.get<Page<TripRead>>("/trips", { params });
    return data;
  },

  get: async (id: number): Promise<TripRead> => {
    const { data } = await apiClient.get<TripRead>(`/trips/${id}`);
    return data;
  },

  create: async (payload: TripCreate): Promise<TripRead> => {
    const { data } = await apiClient.post<TripRead>("/trips", payload);
    return data;
  },

  update: async (id: number, payload: TripUpdate): Promise<TripRead> => {
    const { data } = await apiClient.patch<TripRead>(`/trips/${id}`, payload);
    return data;
  },

  dispatch: async (id: number): Promise<TripRead> => {
    const { data } = await apiClient.post<TripRead>(`/trips/${id}/dispatch`);
    return data;
  },

  complete: async (id: number, payload: TripComplete): Promise<TripRead> => {
    const { data } = await apiClient.post<TripRead>(`/trips/${id}/complete`, payload);
    return data;
  },

  cancel: async (id: number): Promise<TripRead> => {
    const { data } = await apiClient.post<TripRead>(`/trips/${id}/cancel`);
    return data;
  },
};
