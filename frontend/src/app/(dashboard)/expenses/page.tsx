"use client";

import * as React from "react";

import { ExportPdfButton } from "@/components/export-pdf-button";
import { FuelExpenseTabs } from "@/components/layout/fuel-expense-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { ExpensesTable } from "@/features/expenses/components/expenses-table";

export default function ExpensesPage() {
  const exportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <PageHeader
        title="Fuel & Expenses"
        description="Capture tolls, maintenance, and other day-to-day fleet spending."
        actions={<ExportPdfButton targetRef={exportRef} filename="expenses.pdf" title="Expenses" />}
      />

      <PermissionGuard permissions={["expenses:read"]}>
        <FuelExpenseTabs />
        <div ref={exportRef}>
          <ExpensesTable />
        </div>
      </PermissionGuard>
    </div>
  );
}
