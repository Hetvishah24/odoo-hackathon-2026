import { apiClient } from "@/lib/api-client";
import type { Page } from "@/lib/types";
import type { FuelLogListParams, FuelLogRead } from "@/features/fuel-logs/types";

export const fuelLogsApi = {
  list: async (params: FuelLogListParams): Promise<Page<FuelLogRead>> => {
    const { data } = await apiClient.get<Page<FuelLogRead>>("/fuel-logs", { params });
    return data;
  },
};
