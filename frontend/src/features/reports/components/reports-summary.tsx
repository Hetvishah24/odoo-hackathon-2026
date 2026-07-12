"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getErrorMessage } from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFleetUtilizationReport, useFuelEfficiencyReport } from "@/features/reports/hooks";

export function ReportsSummary() {
  const { data: utilization, isLoading: isUtilLoading, isError: isUtilError, error: utilError } =
    useFleetUtilizationReport();
  const {
    data: efficiency,
    isLoading: isEffLoading,
    isError: isEffError,
    error: effError,
  } = useFuelEfficiencyReport();

  if (isUtilError || isEffError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load reports</AlertTitle>
        <AlertDescription>
          {getErrorMessage(isUtilError ? utilError : effError)}
        </AlertDescription>
      </Alert>
    );
  }

  const loading = isUtilLoading || isEffLoading;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{loading ? <Skeleton className="h-10 w-[6rem]" /> : utilization?.available_vehicles ?? 0}</p>
            <p className="text-sm text-muted-foreground">vehicles ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>On trip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{loading ? <Skeleton className="h-10 w-[6rem]" /> : utilization?.on_trip_vehicles ?? 0}</p>
            <p className="text-sm text-muted-foreground">vehicles dispatched</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{loading ? <Skeleton className="h-10 w-[6rem]" /> : `${utilization?.fleet_utilization_pct ?? 0}%`}</p>
            <p className="text-sm text-muted-foreground">fleet utilization</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="h-[420px]">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Fuel efficiency per vehicle</CardTitle>
              <Badge variant="secondary">Last 30 days</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-full">
            {loading ? (
              <div className="h-full rounded-md bg-muted p-6" />
            ) : efficiency && efficiency.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiency}> 
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
                  <XAxis dataKey="vehicle_id" tickFormatter={(id) => `V${id}`} />
                  <YAxis />
                  <Tooltip formatter={(value) => value ?? "N/A"} />
                  <Bar dataKey="fuel_efficiency_km_per_l" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No fuel efficiency data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top fuel efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : efficiency && efficiency.length > 0 ? (
              efficiency.slice(0, 3).map((row) => (
                <div key={row.vehicle_id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">Vehicle {row.vehicle_id}</p>
                    <Badge>{row.fuel_efficiency_km_per_l?.toFixed(2) ?? "N/A"} km/l</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{row.total_distance.toFixed(0)} km, {row.total_liters.toFixed(0)} L</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No efficiency rows to display.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet utilization details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Trips</TableHead>
                <TableHead>Distance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : utilization?.per_vehicle.length ? (
                utilization.per_vehicle.map((row) => (
                  <TableRow key={row.vehicle_id}>
                    <TableCell>V{row.vehicle_id}</TableCell>
                    <TableCell>{row.trip_count}</TableCell>
                    <TableCell>{row.total_distance.toFixed(0)} km</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No utilization details found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
