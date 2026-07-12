import type { ExpenseType } from "@/features/expenses/types";

export const expenseTypes: ExpenseType[] = ["toll", "maintenance", "other"];

export const expenseTypeLabels: Record<ExpenseType, string> = {
  toll: "Toll",
  maintenance: "Maintenance",
  other: "Other",
};

export const expenseTypeStyles: Record<ExpenseType, string> = {
  toll: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  maintenance: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  other: "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
};
