"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { FuelLogsTable } from "@/features/fuel-logs/components/fuel-logs-table";

export default function FuelLogsPage() {
  return (
    <div>
      <PageHeader title="Fuel Logs" description="Review fuel consumption and spending." />

      <PermissionGuard permissions={["fuel:read"]}>
        <FuelLogsTable />
      </PermissionGuard>
    </div>
  );
}
