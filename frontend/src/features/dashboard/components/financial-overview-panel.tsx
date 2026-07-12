"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { FinancialOverview } from "@/features/dashboard/types";

export function FinancialOverviewPanel({ data }: { data: FinancialOverview }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Operational cost" value={`$${data.total_operational_cost.toFixed(0)}`} />
        <StatCard label="Fuel cost" value={`$${data.total_fuel_cost.toFixed(0)}`} />
        <StatCard label="Maintenance cost" value={`$${data.total_maintenance_cost.toFixed(0)}`} />
        <StatCard label="Average ROI" value={`${data.average_roi_pct}%`} />
      </div>
      <Card className="h-[340px]">
        <CardHeader>
          <CardTitle>Cost breakdown by vehicle</CardTitle>
        </CardHeader>
        <CardContent className="h-full pb-6">
          {data.cost_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cost_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
                <XAxis dataKey="registration_number" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fuel_cost" name="Fuel" stackId="cost" fill="var(--primary)" />
                <Bar
                  dataKey="maintenance_cost"
                  name="Maintenance"
                  stackId="cost"
                  fill="var(--muted-foreground)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No cost data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
