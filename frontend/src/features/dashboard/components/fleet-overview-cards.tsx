"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { FleetOverview } from "@/features/dashboard/types";

const STATUS_COLORS: Record<string, string> = {
  available: "#16a34a",
  on_trip: "#2563eb",
  in_shop: "#d97706",
  retired: "#6b7280",
};

export function FleetOverviewCards({ data }: { data: FleetOverview }) {
  const breakdown = Object.entries(data.vehicle_status_breakdown).map(([status, count]) => ({
    status,
    count,
  }));
  const hasBreakdown = breakdown.some((row) => row.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active vehicles" value={data.active_vehicles} />
          <StatCard label="Available" value={data.available_vehicles} />
          <StatCard label="In maintenance" value={data.vehicles_in_maintenance} />
          <StatCard
            label="Utilization"
            value={<Badge variant="secondary">{data.fleet_utilization_pct}%</Badge>}
          />
        </div>
        {hasBreakdown && (
          <div className="grid gap-4 md:grid-cols-[200px_1fr] md:items-center">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={40}
                    outerRadius={70}
                  >
                    {breakdown.map((row) => (
                      <Cell key={row.status} fill={STATUS_COLORS[row.status] ?? "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {breakdown.map((row) => (
                <Badge key={row.status} variant="outline" className="capitalize">
                  {row.status.replace("_", " ")}: {row.count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
