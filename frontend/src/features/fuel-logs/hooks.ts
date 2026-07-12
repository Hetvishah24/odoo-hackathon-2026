"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fuelLogsApi } from "@/features/fuel-logs/api";
import type { FuelLogListParams } from "@/features/fuel-logs/types";

const FUEL_LOGS_KEY = "fuel-logs";

export function useFuelLogs(params: FuelLogListParams) {
  return useQuery({
    queryKey: [FUEL_LOGS_KEY, params],
    queryFn: () => fuelLogsApi.list(params),
    placeholderData: keepPreviousData,
  });
}
