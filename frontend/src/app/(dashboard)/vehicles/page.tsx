"use client";

import * as React from "react";

import { ExportPdfButton } from "@/components/export-pdf-button";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { VehiclesTable } from "@/features/vehicles/components/vehicles-table";

export default function VehiclesPage() {
  const exportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        description="Track fleet inventory, readiness, and service states."
        actions={
          <ExportPdfButton targetRef={exportRef} filename="vehicle-registry.pdf" title="Vehicle Registry" />
        }
      />

      <div ref={exportRef}>
        <PermissionGuard permissions={["vehicles:read"]}>
          <VehiclesTable />
        </PermissionGuard>
      </div>
    </div>
  );
}
