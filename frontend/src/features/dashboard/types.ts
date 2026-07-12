export type VehicleStatus = "available" | "on_trip" | "in_shop" | "retired";
export type TripStatus = "draft" | "dispatched" | "completed" | "cancelled";

export interface FleetOverview {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  retired_vehicles: number;
  fleet_utilization_pct: number;
  vehicle_status_breakdown: Record<VehicleStatus, number>;
}

export interface RecentTrip {
  id: number;
  trip_number: string;
  vehicle: string;
  driver: string;
  status: TripStatus;
  eta_minutes: number | null;
}

export interface TripOverview {
  active_trips: number;
  pending_trips: number;
  recent_trips: RecentTrip[];
}

export interface DriverOverview {
  drivers_on_duty: number;
  drivers_available: number;
  drivers_suspended: number;
  licenses_expiring_soon: number;
}

export interface LicenseAlert {
  driver_id: number;
  name: string;
  license_expiry_date: string;
  days_remaining: number;
}

export interface SafetyOverview {
  average_safety_score: number;
  license_alerts: LicenseAlert[];
}

export interface CostBreakdownRow {
  vehicle_id: number;
  registration_number: string | null;
  fuel_cost: number;
  maintenance_cost: number;
}

export interface FinancialOverview {
  total_operational_cost: number;
  total_fuel_cost: number;
  total_maintenance_cost: number;
  average_roi_pct: number;
  cost_breakdown: CostBreakdownRow[];
}

export interface MyVehicle {
  registration_number: string;
  status: VehicleStatus;
}

export interface MyActiveTrip {
  trip_number: string;
  source: string;
  destination: string;
  status: TripStatus;
  eta_minutes: number | null;
}

export interface MyUpcomingTrip {
  trip_number: string;
  source: string;
  destination: string;
  status: TripStatus;
}

export interface MyDashboard {
  my_vehicle: MyVehicle | null;
  my_active_trip: MyActiveTrip | null;
  my_upcoming_trips: MyUpcomingTrip[];
  my_completed_trips_count: number;
  my_safety_score: number;
}

export interface DashboardSections {
  fleet_overview?: FleetOverview;
  trip_overview?: TripOverview;
  driver_overview?: DriverOverview;
  safety_overview?: SafetyOverview;
  financial_overview?: FinancialOverview;
  my_dashboard?: MyDashboard | null;
}

export interface DashboardResponse {
  role: string | null;
  user: { id: number; full_name: string };
  sections: DashboardSections;
}
