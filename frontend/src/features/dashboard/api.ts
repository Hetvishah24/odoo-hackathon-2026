import { apiClient } from "@/lib/api-client";
import type { DashboardResponse } from "@/features/dashboard/types";

export const dashboardApi = {
  get: async (): Promise<DashboardResponse> => {
    const { data } = await apiClient.get<DashboardResponse>("/dashboard");
    return data;
  },
};
