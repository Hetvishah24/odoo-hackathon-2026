"use client";

import * as React from "react";

import { ExportPdfButton } from "@/components/export-pdf-button";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-context";
import { DashboardError } from "@/features/dashboard/components/dashboard-error";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { DriverOverviewCards } from "@/features/dashboard/components/driver-overview-cards";
import { FinancialOverviewPanel } from "@/features/dashboard/components/financial-overview-panel";
import { FleetOverviewCards } from "@/features/dashboard/components/fleet-overview-cards";
import { MyDriverDashboard } from "@/features/dashboard/components/my-driver-dashboard";
import { SafetyOverviewPanel } from "@/features/dashboard/components/safety-overview-panel";
import { TripOverviewTable } from "@/features/dashboard/components/trip-overview-table";
import { useDashboard } from "@/features/dashboard/hooks";
import { formatRoleLabel } from "@/features/dashboard/utils";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const sections = data?.sections;
  const exportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.full_name ?? ""}.`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {formatRoleLabel(data?.role ?? user?.role?.name ?? null)}
            </Badge>
            {!isLoading && !isError && (
              <ExportPdfButton targetRef={exportRef} filename="dashboard.pdf" title="Dashboard" />
            )}
          </div>
        }
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <DashboardError message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <div ref={exportRef} className="space-y-6">
          {/* Section-driven, not role-driven: render purely off which keys the API
           * returned. A new role later needs zero changes here. */}
          {sections?.fleet_overview && <FleetOverviewCards data={sections.fleet_overview} />}
          {sections?.trip_overview && (
            <TripOverviewTable
              data={sections.trip_overview}
              showActions={hasPermission("trips:write")}
            />
          )}
          {sections?.driver_overview && <DriverOverviewCards data={sections.driver_overview} />}
          {sections?.safety_overview && <SafetyOverviewPanel data={sections.safety_overview} />}
          {sections?.financial_overview && (
            <FinancialOverviewPanel data={sections.financial_overview} />
          )}
          {sections?.my_dashboard !== undefined && (
            <MyDriverDashboard data={sections.my_dashboard} />
          )}
          {sections && Object.keys(sections).length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing to show yet — your account may still be pending approval.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
