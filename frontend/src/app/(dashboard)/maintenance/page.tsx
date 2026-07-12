"use client";

import * as React from "react";

import { ExportPdfButton } from "@/components/export-pdf-button";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { MaintenanceTable } from "@/features/maintenance/components/maintenance-table";

export default function MaintenancePage() {
  const exportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track service work and maintenance outcomes."
        actions={<ExportPdfButton targetRef={exportRef} filename="maintenance.pdf" title="Maintenance" />}
      />

      <div ref={exportRef}>
        <PermissionGuard permissions={["maintenance:read"]}>
          <MaintenanceTable />
        </PermissionGuard>
      </div>
    </div>
  );
}
