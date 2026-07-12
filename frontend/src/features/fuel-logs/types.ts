export interface FuelLogRead {
  id: number;
  vehicle_id: number;
  trip_id: number | null;
  liters: number;
  cost: number;
  date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface FuelLogCreate {
  vehicle_id: number;
  trip_id?: number | null;
  liters: number;
  cost: number;
  date: string;
}

export type FuelLogUpdate = Partial<FuelLogCreate>;

export interface FuelLogListParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  vehicle_id?: number;
  trip_id?: number;
  date_from?: string;
  date_to?: string;
}
