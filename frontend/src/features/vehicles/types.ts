export type VehicleType = "truck" | "van" | "bike" | "trailer" | "other";
export type VehicleStatus = "available" | "on_trip" | "in_shop" | "retired";

export interface VehicleRead {
  id: number;
  registration_number: string;
  name_model: string;
  type: VehicleType;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  revenue_per_km: number;
  status: VehicleStatus;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  registration_number: string;
  name_model: string;
  type: VehicleType;
  max_load_capacity: number;
  odometer?: number;
  acquisition_cost: number;
  revenue_per_km?: number;
  status?: VehicleStatus;
  region?: string | null;
}

export type VehicleUpdate = Partial<VehicleCreate>;
