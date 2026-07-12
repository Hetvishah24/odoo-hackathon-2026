"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { ExpensesTable } from "@/features/expenses/components/expenses-table";

export default function ExpensesPage() {
  return (
    <div>
      <PageHeader title="Expenses" description="Capture day-to-day fleet spending." />

      <PermissionGuard permissions={["expenses:read"]}>
        <ExpensesTable />
      </PermissionGuard>
    </div>
  );
}
