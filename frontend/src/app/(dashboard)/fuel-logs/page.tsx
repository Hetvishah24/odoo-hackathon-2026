"use client";

import * as React from "react";

import { ExportPdfButton } from "@/components/export-pdf-button";
import { FuelExpenseTabs } from "@/components/layout/fuel-expense-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { FuelLogsTable } from "@/features/fuel-logs/components/fuel-logs-table";

export default function FuelLogsPage() {
  const exportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <PageHeader
        title="Fuel & Expenses"
        description="Track fuel fill-ups and other fleet spending."
        actions={<ExportPdfButton targetRef={exportRef} filename="fuel-logs.pdf" title="Fuel Logs" />}
      />

      <PermissionGuard permissions={["fuel:read"]}>
        <FuelExpenseTabs />
        <div ref={exportRef}>
          <FuelLogsTable />
        </div>
      </PermissionGuard>
    </div>
  );
}
