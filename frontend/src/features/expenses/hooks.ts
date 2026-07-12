"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { expensesApi } from "@/features/expenses/api";
import type { ExpenseCreate, ExpenseListParams, ExpenseUpdate } from "@/features/expenses/types";

const EXPENSES_KEY = "expenses";

export function useExpenses(params: ExpenseListParams) {
  return useQuery({
    queryKey: [EXPENSES_KEY, params],
    queryFn: () => expensesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpenseCreate) => expensesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      toast.success("Expense created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ExpenseUpdate }) =>
      expensesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      toast.success("Expense updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => expensesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      toast.success("Expense deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
