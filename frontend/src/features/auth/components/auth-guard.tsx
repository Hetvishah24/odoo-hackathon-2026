"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";

/**
 * Renders children only for an authenticated user who is active, approved, and
 * has completed their step-2 profile. Redirects to /login if unauthenticated,
 * to /complete-profile if profile setup is unfinished, and otherwise shows a
 * blocking message for inactive/unapproved accounts (dashboard stays hidden).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  React.useEffect(() => {
    if (user?.is_active && user.is_approved && !user.is_profile_complete) {
      router.replace("/complete-profile");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!user.is_active) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Account not activated</AlertTitle>
          <AlertDescription>
            Your account has been deactivated. Contact an administrator if you believe this is a
            mistake.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>
    );
  }

  if (!user.is_approved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Alert className="max-w-md">
          <AlertTitle>Account pending approval</AlertTitle>
          <AlertDescription>
            Your account is awaiting approval from an administrator. You&apos;ll get access once
            it&apos;s approved.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>
    );
  }

  if (!user.is_profile_complete) {
    // useEffect above is already redirecting to /complete-profile.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
