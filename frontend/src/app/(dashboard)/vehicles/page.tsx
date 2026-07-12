"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { VehiclesTable } from "@/features/vehicles/components/vehicles-table";

export default function VehiclesPage() {
  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        description="Track fleet inventory, readiness, and service states."
      />

      <PermissionGuard permissions={["vehicles:read"]}>
        <VehiclesTable />
      </PermissionGuard>
    </div>
  );
}
