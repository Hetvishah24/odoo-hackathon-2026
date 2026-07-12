"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useCancelTrip } from "@/features/trips/hooks";
import type { TripRead } from "@/features/trips/types";

interface TripCancelDialogProps {
  trip: TripRead | null;
  onClose: () => void;
}

export function TripCancelDialog({ trip, onClose }: TripCancelDialogProps) {
  const cancelTrip = useCancelTrip();

  const handleCancel = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!trip) return;
    await cancelTrip.mutateAsync(trip.id);
    onClose();
  };

  return (
    <AlertDialog open={Boolean(trip)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel trip</AlertDialogTitle>
          <AlertDialogDescription>
            {trip?.status === "dispatched"
              ? `This will cancel the trip from ${trip.source} to ${trip.destination} and restore the vehicle and driver to available.`
              : `This will cancel the trip from ${trip?.source} to ${trip?.destination}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep trip</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={handleCancel}
            disabled={cancelTrip.isPending}
          >
            {cancelTrip.isPending && <Loader2 className="animate-spin" />}
            Cancel trip
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
