"use client";

import { FuelExpenseTabs } from "@/components/layout/fuel-expense-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { FuelLogsTable } from "@/features/fuel-logs/components/fuel-logs-table";

export default function FuelLogsPage() {
  return (
    <div>
      <PageHeader title="Fuel & Expenses" description="Track fuel fill-ups and other fleet spending." />

      <PermissionGuard permissions={["fuel:read"]}>
        <FuelExpenseTabs />
        <FuelLogsTable />
      </PermissionGuard>
    </div>
  );
}
