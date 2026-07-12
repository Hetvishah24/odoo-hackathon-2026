"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { fuelLogsApi } from "@/features/fuel-logs/api";
import type { FuelLogCreate, FuelLogListParams, FuelLogUpdate } from "@/features/fuel-logs/types";

const FUEL_LOGS_KEY = "fuel-logs";

export function useFuelLogs(params: FuelLogListParams) {
  return useQuery({
    queryKey: [FUEL_LOGS_KEY, params],
    queryFn: () => fuelLogsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FuelLogCreate) => fuelLogsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FUEL_LOGS_KEY] });
      toast.success("Fuel log created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateFuelLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FuelLogUpdate }) =>
      fuelLogsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FUEL_LOGS_KEY] });
      toast.success("Fuel log updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteFuelLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fuelLogsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FUEL_LOGS_KEY] });
      toast.success("Fuel log deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
