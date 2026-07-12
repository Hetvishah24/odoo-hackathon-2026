"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { ReportsSummary } from "@/features/reports/components/reports-summary";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" description="Monitor utilization, spend, and fleet performance." />

      <PermissionGuard permissions={["reports:read"]}>
        <ReportsSummary />
      </PermissionGuard>
    </div>
  );
}
