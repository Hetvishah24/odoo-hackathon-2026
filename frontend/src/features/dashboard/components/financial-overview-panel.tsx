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
import { formatCurrency, getRoiColorClass } from "@/lib/utils";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { FinancialOverview } from "@/features/dashboard/types";

export function FinancialOverviewPanel({ data }: { data: FinancialOverview }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Operational cost" value={formatCurrency(data.total_operational_cost)} />
        <StatCard label="Fuel cost" value={formatCurrency(data.total_fuel_cost)} />
        <StatCard label="Maintenance cost" value={formatCurrency(data.total_maintenance_cost)} />
        <StatCard
          label="Average ROI"
          value={
            <span className={getRoiColorClass(data.average_roi_pct)}>{data.average_roi_pct}%</span>
          }
        />
      </div>
      <Card className="h-[340px]">
        <CardHeader>
          <CardTitle>Cost breakdown by vehicle</CardTitle>
        </CardHeader>
        <CardContent className="h-full pb-6">
          {data.cost_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cost_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="registration_number" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
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
            <p className="text-sm text-muted-foreground">No cost data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
