export type DriverStatus = "available" | "on_trip" | "off_duty" | "suspended";

export interface DriverRead {
  id: number;
  user_id: number | null;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: DriverStatus;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverUpdate {
  user_id?: number | null;
  name?: string;
  license_number?: string;
  license_category?: string;
  license_expiry_date?: string;
  contact_number?: string;
  safety_score?: number;
  status?: DriverStatus;
  region?: string | null;
}
