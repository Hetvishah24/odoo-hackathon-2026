"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { DriversTable } from "@/features/drivers/components/drivers-table";

export default function DriversPage() {
  return (
    <div>
      <PageHeader title="Drivers" description="Monitor driver availability and license status." />

      <PermissionGuard permissions={["drivers:read"]}>
        <DriversTable />
      </PermissionGuard>
    </div>
  );
}
