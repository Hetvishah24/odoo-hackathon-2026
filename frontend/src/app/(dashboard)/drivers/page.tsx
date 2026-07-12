"use client";

import * as React from "react";

import { ExportPdfButton } from "@/components/export-pdf-button";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { DriversTable } from "@/features/drivers/components/drivers-table";

export default function DriversPage() {
  const exportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <PageHeader
        title="Drivers & Safety Profiles"
        description="Monitor driver availability, license status, and safety scores."
        actions={<ExportPdfButton targetRef={exportRef} filename="drivers.pdf" title="Drivers & Safety Profiles" />}
      />

      <div ref={exportRef}>
        <PermissionGuard permissions={["drivers:read"]}>
          <DriversTable />
        </PermissionGuard>
      </div>
    </div>
  );
}
