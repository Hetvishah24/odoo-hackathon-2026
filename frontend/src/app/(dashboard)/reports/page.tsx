"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { ReportsSummary } from "@/features/reports/components/reports-summary";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Review operational and cost reporting snapshots." />

      <PermissionGuard permissions={["reports:read"]}>
        <ReportsSummary />
      </PermissionGuard>
    </div>
  );
}
