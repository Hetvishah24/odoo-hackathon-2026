export interface FuelEfficiencyRow {
  vehicle_id: number;
  total_distance: number;
  total_liters: number;
  fuel_efficiency_km_per_l: number | null;
}

export interface OperationalCostRow {
  vehicle_id: number;
  fuel_cost: number;
  maintenance_cost: number;
  total_operational_cost: number;
}

export interface VehicleROIRow {
  vehicle_id: number;
  revenue: number;
  fuel_cost: number;
  maintenance_cost: number;
  acquisition_cost: number;
  roi: number | null;
}

export interface FleetUtilizationRow {
  vehicle_id: number;
  trip_count: number;
  total_distance: number;
}

export interface FleetUtilizationResponse {
  available_vehicles: number;
  on_trip_vehicles: number;
  in_shop_vehicles: number;
  fleet_utilization_pct: number;
  per_vehicle: FleetUtilizationRow[];
}
