import { apiClient } from "@/lib/api-client";
import type { Page } from "@/lib/types";
import type { TripListParams, TripRead } from "@/features/trips/types";

export const tripsApi = {
  list: async (params: TripListParams): Promise<Page<TripRead>> => {
    const { data } = await apiClient.get<Page<TripRead>>("/trips", { params });
    return data;
  },
};
