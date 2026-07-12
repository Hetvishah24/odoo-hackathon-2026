import { apiClient } from "@/lib/api-client";
import type { Page } from "@/lib/types";
import type {
  ExpenseCreate,
  ExpenseListParams,
  ExpenseRead,
  ExpenseUpdate,
} from "@/features/expenses/types";

export const expensesApi = {
  list: async (params: ExpenseListParams): Promise<Page<ExpenseRead>> => {
    const { data } = await apiClient.get<Page<ExpenseRead>>("/expenses", { params });
    return data;
  },

  create: async (payload: ExpenseCreate): Promise<ExpenseRead> => {
    const { data } = await apiClient.post<ExpenseRead>("/expenses", payload);
    return data;
  },

  update: async (id: number, payload: ExpenseUpdate): Promise<ExpenseRead> => {
    const { data } = await apiClient.patch<ExpenseRead>(`/expenses/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },
};
