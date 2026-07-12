"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getErrorMessage } from "@/lib/api-client";
import { chartTooltipContentStyle, chartTooltipItemStyle, chartTooltipLabelStyle } from "@/lib/chart-theme";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFuelEfficiencyReport } from "@/features/reports/hooks";
import type { ReportFilters } from "@/features/reports/types";
import { useVehicleLookup, vehicleLabel } from "@/features/reports/utils";

export function FuelEfficiencyReport({ filters }: { filters: ReportFilters }) {
  const { data, isLoading, isError, error } = useFuelEfficiencyReport(filters);
  const lookup = useVehicleLookup();

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load fuel efficiency report</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  const chartData = (data ?? []).map((row) => ({
    ...row,
    label: vehicleLabel(lookup, row.vehicle_id),
  }));

  return (
    <div className="space-y-4">
      <Card className="h-[340px]">
        <CardHeader>
          <CardTitle>Distance per liter, by vehicle</CardTitle>
        </CardHeader>
        <CardContent className="h-full pb-6">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  formatter={(value) => (value == null ? "N/A" : value)}
                  contentStyle={chartTooltipContentStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                />
                <Bar dataKey="fuel_efficiency_km_per_l" name="km/L" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No fuel efficiency data for the selected filters.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Fuel used</TableHead>
              <TableHead>Efficiency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((row) => (
                <TableRow key={row.vehicle_id}>
                  <TableCell className="font-medium">{vehicleLabel(lookup, row.vehicle_id)}</TableCell>
                  <TableCell>{row.total_distance.toFixed(0)} km</TableCell>
                  <TableCell>{row.total_liters.toFixed(1)} L</TableCell>
                  <TableCell>
                    {row.fuel_efficiency_km_per_l !== null
                      ? `${row.fuel_efficiency_km_per_l.toFixed(2)} km/L`
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No fuel efficiency data for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
