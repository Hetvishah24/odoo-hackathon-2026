"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { expensesApi } from "@/features/expenses/api";
import type { ExpenseListParams } from "@/features/expenses/types";

const EXPENSES_KEY = "expenses";

export function useExpenses(params: ExpenseListParams) {
  return useQuery({
    queryKey: [EXPENSES_KEY, params],
    queryFn: () => expensesApi.list(params),
    placeholderData: keepPreviousData,
  });
}
