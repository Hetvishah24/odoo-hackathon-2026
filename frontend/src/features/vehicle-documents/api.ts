import { apiClient } from "@/lib/api-client";
import type { VehicleDocumentCreate, VehicleDocumentRead } from "@/features/vehicle-documents/types";

export const vehicleDocumentsApi = {
  // Intentionally always filtered by vehicle_id - this is a small per-vehicle list, not a
  // global documents table (see 05_VEHICLE_DOCUMENTS.md).
  list: async (vehicleId: number): Promise<VehicleDocumentRead[]> => {
    const { data } = await apiClient.get<VehicleDocumentRead[]>("/vehicle-documents", {
      params: { vehicle_id: vehicleId },
    });
    return data;
  },

  create: async (payload: VehicleDocumentCreate): Promise<VehicleDocumentRead> => {
    const { data } = await apiClient.post<VehicleDocumentRead>("/vehicle-documents", payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/vehicle-documents/${id}`);
  },
};
