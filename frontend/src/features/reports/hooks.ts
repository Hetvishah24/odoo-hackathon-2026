"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { reportsApi } from "@/features/reports/api";
import type {
  FleetUtilizationResponse,
  FuelEfficiencyRow,
  OperationalCostRow,
  ReportFilters,
  ReportType,
  VehicleROIRow,
} from "@/features/reports/types";

const REPORTS_KEY = "reports";

export function useFuelEfficiencyReport(params: ReportFilters) {
  return useQuery<FuelEfficiencyRow[]>({
    queryKey: [REPORTS_KEY, "fuel-efficiency", params],
    queryFn: () => reportsApi.fuelEfficiency(params),
  });
}

export function useFleetUtilizationReport(params: ReportFilters) {
  return useQuery<FleetUtilizationResponse>({
    queryKey: [REPORTS_KEY, "fleet-utilization", params],
    queryFn: () => reportsApi.fleetUtilization(params),
  });
}

export function useOperationalCostReport(params: ReportFilters) {
  return useQuery<OperationalCostRow[]>({
    queryKey: [REPORTS_KEY, "operational-cost", params],
    queryFn: () => reportsApi.operationalCost(params),
  });
}

export function useVehicleRoiReport(params: ReportFilters) {
  return useQuery<VehicleROIRow[]>({
    queryKey: [REPORTS_KEY, "vehicle-roi", params],
    queryFn: () => reportsApi.vehicleRoi(params),
  });
}

export function useExportReportCsv() {
  return useMutation({
    mutationFn: ({ type, params }: { type: ReportType; params: ReportFilters }) =>
      reportsApi.exportCsv(type, params),
    onSuccess: (blob, { type }) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
