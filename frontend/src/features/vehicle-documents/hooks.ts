"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { vehicleDocumentsApi } from "@/features/vehicle-documents/api";
import type { VehicleDocumentCreate } from "@/features/vehicle-documents/types";

const VEHICLE_DOCUMENTS_KEY = "vehicle-documents";

export function useVehicleDocuments(vehicleId: number | undefined) {
  return useQuery({
    queryKey: [VEHICLE_DOCUMENTS_KEY, vehicleId],
    queryFn: () => vehicleDocumentsApi.list(vehicleId as number),
    enabled: vehicleId !== undefined,
  });
}

export function useCreateVehicleDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehicleDocumentCreate) => vehicleDocumentsApi.create(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_DOCUMENTS_KEY, variables.vehicle_id] });
      toast.success("Document added");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteVehicleDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehicleDocumentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_DOCUMENTS_KEY] });
      toast.success("Document deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
