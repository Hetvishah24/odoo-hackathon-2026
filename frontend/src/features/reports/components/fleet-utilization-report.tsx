"use client";

import { getErrorMessage } from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { useFleetUtilizationReport } from "@/features/reports/hooks";
import type { ReportFilters } from "@/features/reports/types";
import { useVehicleLookup, vehicleLabel } from "@/features/reports/utils";

export function FleetUtilizationReport({ filters }: { filters: ReportFilters }) {
  const { data, isLoading, isError, error } = useFleetUtilizationReport(filters);
  const lookup = useVehicleLookup();

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load fleet utilization report</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aggregate response is a single dict, not a list - a stat panel fits it better
          than forcing it into the same table component every other report uses. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : (data?.available_vehicles ?? 0)}
        />
        <StatCard
          label="On trip"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : (data?.on_trip_vehicles ?? 0)}
        />
        <StatCard
          label="In shop"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : (data?.in_shop_vehicles ?? 0)}
        />
        <StatCard
          label="Fleet utilization"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : `${data?.fleet_utilization_pct ?? 0}%`}
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Completed trips</TableHead>
              <TableHead>Total distance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : data && data.per_vehicle.length > 0 ? (
              data.per_vehicle.map((row) => (
                <TableRow key={row.vehicle_id}>
                  <TableCell className="font-medium">{vehicleLabel(lookup, row.vehicle_id)}</TableCell>
                  <TableCell>{row.trip_count}</TableCell>
                  <TableCell>{row.total_distance.toFixed(0)} km</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No utilization details for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
