"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/features/auth/auth-context";
import { CompleteProfileForm } from "@/features/profile/components/complete-profile-form";

/** Only reachable by an authenticated user whose profile isn't done yet. */
export function CompleteProfileGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.is_profile_complete) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.is_profile_complete) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <CompleteProfileForm />
    </div>
  );
}
