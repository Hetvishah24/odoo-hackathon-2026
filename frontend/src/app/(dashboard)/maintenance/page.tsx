"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { MaintenanceTable } from "@/features/maintenance/components/maintenance-table";

export default function MaintenancePage() {
  return (
    <div>
      <PageHeader title="Maintenance" description="Track service work and maintenance outcomes." />

      <PermissionGuard permissions={["maintenance:read"]}>
        <MaintenanceTable />
      </PermissionGuard>
    </div>
  );
}
