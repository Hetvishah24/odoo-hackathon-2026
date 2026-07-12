"use client";

import { FuelExpenseTabs } from "@/components/layout/fuel-expense-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { ExpensesTable } from "@/features/expenses/components/expenses-table";

export default function ExpensesPage() {
  return (
    <div>
      <PageHeader title="Fuel & Expenses" description="Capture tolls, maintenance, and other day-to-day fleet spending." />

      <PermissionGuard permissions={["expenses:read"]}>
        <FuelExpenseTabs />
        <ExpensesTable />
      </PermissionGuard>
    </div>
  );
}
