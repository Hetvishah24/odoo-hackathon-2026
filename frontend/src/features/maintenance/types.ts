export type MaintenanceStatus = "open" | "closed";

export interface MaintenanceRead {
  id: number;
  vehicle_id: number;
  description: string;
  cost: number;
  opened_at: string;
  closed_at: string | null;
  status: MaintenanceStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceCreate {
  vehicle_id: number;
  description: string;
  cost: number;
  opened_at: string;
}

export interface MaintenanceUpdate {
  description?: string;
  cost?: number;
  opened_at?: string;
}
