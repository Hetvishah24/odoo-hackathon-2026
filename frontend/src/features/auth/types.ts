export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
}

/** Roles a user may self-assign at registration. Admin is provisioned separately. */
export type RegisterableRole = "fleet_manager" | "driver" | "safety_officer" | "financial_analyst";

export interface User {
  id: number;
  email: string;
  full_name: string;
  contact_number: string | null;
  region: string | null;
  is_active: boolean;
  is_approved: boolean;
  is_profile_complete: boolean;
  role: Role | null;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: RegisterableRole;
}
