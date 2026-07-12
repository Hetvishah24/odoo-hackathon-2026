"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { DASHBOARD_KEY } from "@/features/dashboard/hooks";
import { DISPATCHABLE_DRIVERS_KEY, DRIVERS_KEY } from "@/features/drivers/hooks";
import { DISPATCHABLE_VEHICLES_KEY, VEHICLES_KEY } from "@/features/vehicles/hooks";
import { tripsApi } from "@/features/trips/api";
import type {
  TripComplete,
  TripCreate,
  TripListParams,
  TripUpdate,
} from "@/features/trips/types";

export const TRIPS_KEY = "trips";

export function useTrips(params: TripListParams) {
  return useQuery({
    queryKey: [TRIPS_KEY, params],
    queryFn: () => tripsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useTrip(id: number | null) {
  return useQuery({
    queryKey: [TRIPS_KEY, id],
    queryFn: () => tripsApi.get(id as number),
    enabled: id !== null,
  });
}

/** Dispatch/complete/cancel flip vehicle+driver availability server-side, and the
 * dashboard's fleet/trip/driver counts depend on that same state — invalidate all
 * four so stale "available" badges don't cause double-booking UX bugs elsewhere. */
function invalidateTripSideEffects(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: [TRIPS_KEY] });
  queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] });
  queryClient.invalidateQueries({ queryKey: [DISPATCHABLE_VEHICLES_KEY] });
  queryClient.invalidateQueries({ queryKey: [DRIVERS_KEY] });
  queryClient.invalidateQueries({ queryKey: [DISPATCHABLE_DRIVERS_KEY] });
  queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TripCreate) => tripsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_KEY] });
      toast.success("Trip created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TripUpdate }) =>
      tripsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_KEY] });
      toast.success("Trip updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDispatchTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tripsApi.dispatch(id),
    onSuccess: () => {
      invalidateTripSideEffects(queryClient);
      toast.success("Trip dispatched");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TripComplete }) =>
      tripsApi.complete(id, payload),
    onSuccess: () => {
      invalidateTripSideEffects(queryClient);
      toast.success("Trip completed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tripsApi.cancel(id),
    onSuccess: () => {
      invalidateTripSideEffects(queryClient);
      toast.success("Trip cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
