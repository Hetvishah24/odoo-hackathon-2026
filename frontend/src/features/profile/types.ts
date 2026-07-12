import type { User } from "@/features/auth/types";
import type { DriverRead } from "@/features/drivers/types";

export interface ProfileCompletionPayload {
  contact_number?: string;
  region?: string;
  license_number?: string;
  license_category?: string;
  license_expiry_date?: string;
}

export interface MyProfileResponse {
  user: User;
  driver: DriverRead | null;
}
