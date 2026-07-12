"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { vehiclesApi, type VehicleListParams } from "@/features/vehicles/api";
import type { VehicleCreate, VehicleUpdate } from "@/features/vehicles/types";

const VEHICLES_KEY = "vehicles";
// No features/dashboard/ hook exists yet (see 03_VEHICLES.md's "invalidate the dashboard
// query" note) - invalidating this key now is a no-op until that query exists, and starts
// working automatically once it does.
const DASHBOARD_KEY = "dashboard";

export function useVehicles(params: VehicleListParams) {
  return useQuery({
    queryKey: [VEHICLES_KEY, params],
    queryFn: () => vehiclesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useDispatchableVehicles() {
  return useQuery({
    queryKey: [VEHICLES_KEY, "dispatchable"],
    queryFn: () => vehiclesApi.dispatchable(),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehicleCreate) => vehiclesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
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
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
      toast.success("Vehicle retired");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
