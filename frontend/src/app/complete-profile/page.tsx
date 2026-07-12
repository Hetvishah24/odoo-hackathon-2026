import type { Metadata } from "next";

import { CompleteProfileGuard } from "@/features/profile/components/complete-profile-guard";

export const metadata: Metadata = {
  title: "Complete your profile",
};

export default function CompleteProfilePage() {
  return <CompleteProfileGuard />;
}
