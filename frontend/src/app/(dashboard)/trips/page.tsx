"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { TripsTable } from "@/features/trips/components/trips-table";

export default function TripsPage() {
  return (
    <div>
      <PageHeader title="Trips" description="Track dispatches, completions, and cancellations." />

      <PermissionGuard permissions={["trips:read"]}>
        <TripsTable />
      </PermissionGuard>
    </div>
  );
}
