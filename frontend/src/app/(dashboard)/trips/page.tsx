"use client";

import * as React from "react";

import { ExportPdfButton } from "@/components/export-pdf-button";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { TripsTable } from "@/features/trips/components/trips-table";

export default function TripsPage() {
  const exportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <PageHeader
        title="Trips"
        description="Track dispatches, completions, and cancellations."
        actions={<ExportPdfButton targetRef={exportRef} filename="trips.pdf" title="Trips" />}
      />

      <div ref={exportRef}>
        <PermissionGuard permissions={["trips:read"]}>
          <TripsTable />
        </PermissionGuard>
      </div>
    </div>
  );
}
