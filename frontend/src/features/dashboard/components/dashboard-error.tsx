"use client";

import { RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Couldn&apos;t load your dashboard</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
