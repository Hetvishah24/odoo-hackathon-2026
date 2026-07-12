"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { DASHBOARD_KEY } from "@/features/dashboard/hooks";
import { VEHICLES_KEY } from "@/features/vehicles/hooks";
import {
  maintenanceApi,
  type MaintenanceListParams,
} from "@/features/maintenance/api";
import type { MaintenanceCreate, MaintenanceUpdate } from "@/features/maintenance/types";

export const MAINTENANCE_KEY = "maintenance";

export function useMaintenanceLogs(params: MaintenanceListParams) {
  return useQuery({
    queryKey: [MAINTENANCE_KEY, params],
    queryFn: () => maintenanceApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Open/close flip the vehicle's status server-side, so both invalidate vehicles + dashboard
// in addition to maintenance itself (per 04_MAINTENANCE.md's status-transition side effect).
export function useOpenMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MaintenanceCreate) => maintenanceApi.open(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_KEY] });
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
      toast.success("Maintenance opened");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCloseMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => maintenanceApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_KEY] });
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
      toast.success("Maintenance closed — vehicle is available again");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MaintenanceUpdate }) =>
      maintenanceApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_KEY] });
      toast.success("Maintenance log updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
