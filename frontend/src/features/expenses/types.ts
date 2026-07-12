export type ExpenseType = "toll" | "maintenance" | "other";

export interface ExpenseRead {
  id: number;
  vehicle_id: number | null;
  trip_id: number | null;
  type: ExpenseType;
  amount: number;
  date: string;
  description: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  vehicle_id?: number | null;
  trip_id?: number | null;
  type: ExpenseType;
  amount: number;
  date: string;
  description?: string | null;
}

export type ExpenseUpdate = Partial<ExpenseCreate>;

export interface ExpenseListParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  vehicle_id?: number;
  trip_id?: number;
  type?: ExpenseType;
  date_from?: string;
  date_to?: string;
}
