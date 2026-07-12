"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { driversApi, type DriverListParams } from "@/features/drivers/api";
import type { DriverUpdate } from "@/features/drivers/types";

export const DRIVERS_KEY = "drivers";
export const DISPATCHABLE_DRIVERS_KEY = "drivers-dispatchable";

export function useDrivers(params: DriverListParams) {
  return useQuery({
    queryKey: [DRIVERS_KEY, params],
    queryFn: () => driversApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useExpiringDrivers(days = 30) {
  return useQuery({
    queryKey: [DRIVERS_KEY, "expiring", days],
    queryFn: () => driversApi.expiring(days),
  });
}

export function useDispatchableDrivers() {
  return useQuery({
    queryKey: [DISPATCHABLE_DRIVERS_KEY],
    queryFn: driversApi.dispatchable,
  });
}

export function useDriver(id: number | null) {
  return useQuery({
    queryKey: [DRIVERS_KEY, id],
    queryFn: () => driversApi.get(id as number),
    enabled: id !== null,
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DriverUpdate }) =>
      driversApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DRIVERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPATCHABLE_DRIVERS_KEY] });
      toast.success("Driver updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => driversApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DRIVERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPATCHABLE_DRIVERS_KEY] });
      toast.success("Driver deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
