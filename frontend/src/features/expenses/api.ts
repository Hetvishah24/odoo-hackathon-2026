import { apiClient } from "@/lib/api-client";
import type { Page } from "@/lib/types";
import type { ExpenseListParams, ExpenseRead } from "@/features/expenses/types";

export const expensesApi = {
  list: async (params: ExpenseListParams): Promise<Page<ExpenseRead>> => {
    const { data } = await apiClient.get<Page<ExpenseRead>>("/expenses", { params });
    return data;
  },
};
