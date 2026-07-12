"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { DASHBOARD_KEY } from "@/features/dashboard/hooks";
import { vehiclesApi, type VehicleListParams } from "@/features/vehicles/api";
import type { VehicleCreate, VehicleUpdate } from "@/features/vehicles/types";

export const VEHICLES_KEY = "vehicles";
export const DISPATCHABLE_VEHICLES_KEY = "vehicles-dispatchable";

export function useVehicles(params: VehicleListParams) {
  return useQuery({
    queryKey: [VEHICLES_KEY, params],
    queryFn: () => vehiclesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useDispatchableVehicles() {
  return useQuery({
    queryKey: [DISPATCHABLE_VEHICLES_KEY],
    queryFn: vehiclesApi.dispatchable,
  });
}

export function useVehicle(id: number | null) {
  return useQuery({
    queryKey: [VEHICLES_KEY, id],
    queryFn: () => vehiclesApi.get(id as number),
    enabled: id !== null,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehicleCreate) => vehiclesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPATCHABLE_VEHICLES_KEY] });
      toast.success("Vehicle created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: VehicleUpdate }) =>
      vehiclesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPATCHABLE_VEHICLES_KEY] });
      toast.success("Vehicle updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRetireVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehiclesApi.retire(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPATCHABLE_VEHICLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
      toast.success("Vehicle retired");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
