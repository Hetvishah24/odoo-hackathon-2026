"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getErrorMessage } from "@/lib/api-client";
import { chartTooltipContentStyle, chartTooltipItemStyle, chartTooltipLabelStyle } from "@/lib/chart-theme";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOperationalCostReport } from "@/features/reports/hooks";
import type { ReportFilters } from "@/features/reports/types";
import { useVehicleLookup, vehicleLabel } from "@/features/reports/utils";

export function OperationalCostReport({ filters }: { filters: ReportFilters }) {
  const { data, isLoading, isError, error } = useOperationalCostReport(filters);
  const lookup = useVehicleLookup();

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load operational cost report</AlertTitle>
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
      {/* Same stacked fuel+maintenance bar chart shape as the Dashboard's financial_overview
          cost_breakdown, per 09_REPORTS.md's "keep them visually consistent" note. */}
      <Card className="h-[340px]">
        <CardHeader>
          <CardTitle>Cost breakdown by vehicle</CardTitle>
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
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={chartTooltipContentStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                />
                <Legend />
                <Bar dataKey="fuel_cost" name="Fuel" stackId="cost" fill="hsl(var(--primary))" />
                <Bar
                  dataKey="maintenance_cost"
                  name="Maintenance"
                  stackId="cost"
                  fill="hsl(var(--muted-foreground))"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No cost data for the selected filters.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Fuel cost</TableHead>
              <TableHead>Maintenance cost</TableHead>
              <TableHead>Total</TableHead>
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
                  <TableCell>{formatCurrency(row.fuel_cost)}</TableCell>
                  <TableCell>{formatCurrency(row.maintenance_cost)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(row.total_operational_cost)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No cost data for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
