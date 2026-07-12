"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { DriversTable } from "@/features/drivers/components/drivers-table";

export default function DriversPage() {
  return (
    <div>
      <PageHeader
        title="Drivers & Safety Profiles"
        description="Monitor driver availability, license status, and safety scores."
      />

      <PermissionGuard permissions={["drivers:read"]}>
        <DriversTable />
      </PermissionGuard>
    </div>
  );
}
