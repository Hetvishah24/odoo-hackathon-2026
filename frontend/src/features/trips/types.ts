export type TripStatus = "draft" | "dispatched" | "completed" | "cancelled";

export interface TripRead {
  id: number;
  source: string;
  destination: string;
  vehicle_id: number;
  driver_id: number;
  cargo_weight: number;
  planned_distance: number;
  actual_distance: number | null;
  start_odometer: number | null;
  end_odometer: number | null;
  fuel_consumed: number | null;
  status: TripStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface TripListParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  status?: TripStatus;
  vehicle_id?: number;
  driver_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface TripCreate {
  source: string;
  destination: string;
  vehicle_id: number;
  driver_id: number;
  cargo_weight: number;
  planned_distance: number;
}

export type TripUpdate = Partial<TripCreate>;

export interface TripComplete {
  end_odometer: number;
  fuel_consumed: number;
  actual_distance: number;
}
