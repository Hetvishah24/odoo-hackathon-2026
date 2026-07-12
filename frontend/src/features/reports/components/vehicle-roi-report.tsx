"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getErrorMessage } from "@/lib/api-client";
import { cn, formatCurrency, getRoiColorClass } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVehicleRoiReport } from "@/features/reports/hooks";
import type { ReportFilters } from "@/features/reports/types";
import { useVehicleLookup, vehicleLabel } from "@/features/reports/utils";

const POSITIVE = "#16a34a";
const NEGATIVE = "#dc2626";

export function VehicleRoiReport({ filters }: { filters: ReportFilters }) {
  const { data, isLoading, isError, error } = useVehicleRoiReport(filters);
  const lookup = useVehicleLookup();

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load vehicle ROI report</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  // Ranked best -> worst, per 09_REPORTS.md's chart guidance.
  const ranked = [...(data ?? [])].sort((a, b) => (b.roi ?? -Infinity) - (a.roi ?? -Infinity));
  const chartData = ranked.map((row) => ({
    ...row,
    label: vehicleLabel(lookup, row.vehicle_id),
    roi_pct: row.roi !== null ? Math.round(row.roi * 10000) / 100 : null,
  }));

  return (
    <div className="space-y-4">
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>ROI by vehicle (best → worst)</CardTitle>
        </CardHeader>
        <CardContent className="h-full pb-6">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis type="number" unit="%" />
                <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="roi_pct" name="ROI">
                  {chartData.map((row) => (
                    <Cell key={row.vehicle_id} fill={(row.roi_pct ?? 0) >= 0 ? POSITIVE : NEGATIVE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No ROI data for the selected filters.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Fuel cost</TableHead>
              <TableHead>Maintenance cost</TableHead>
              <TableHead>Acquisition cost</TableHead>
              <TableHead>ROI</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : ranked.length > 0 ? (
              ranked.map((row) => (
                <TableRow key={row.vehicle_id}>
                  <TableCell className="font-medium">{vehicleLabel(lookup, row.vehicle_id)}</TableCell>
                  <TableCell>{formatCurrency(row.revenue)}</TableCell>
                  <TableCell>{formatCurrency(row.fuel_cost)}</TableCell>
                  <TableCell>{formatCurrency(row.maintenance_cost)}</TableCell>
                  <TableCell>{formatCurrency(row.acquisition_cost)}</TableCell>
                  <TableCell className={cn("font-medium", getRoiColorClass(row.roi !== null ? row.roi * 100 : null))}>
                    {row.roi !== null ? `${(row.roi * 100).toFixed(2)}%` : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No ROI data for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
