"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { tripsApi } from "@/features/trips/api";
import type { TripListParams } from "@/features/trips/types";

const TRIPS_KEY = "trips";

export function useTrips(params: TripListParams) {
  return useQuery({
    queryKey: [TRIPS_KEY, params],
    queryFn: () => tripsApi.list(params),
    placeholderData: keepPreviousData,
  });
}
