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
import { useRetireVehicle } from "@/features/vehicles/hooks";
import type { VehicleRead } from "@/features/vehicles/types";

interface RetireVehicleDialogProps {
  vehicle: VehicleRead | null;
  onClose: () => void;
}

export function RetireVehicleDialog({ vehicle, onClose }: RetireVehicleDialogProps) {
  const retireVehicle = useRetireVehicle();

  const handleRetire = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!vehicle) return;
    await retireVehicle.mutateAsync(vehicle.id);
    onClose();
  };

  return (
    <AlertDialog open={Boolean(vehicle)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retire vehicle</AlertDialogTitle>
          <AlertDialogDescription>
            Retire <strong>{vehicle?.name_model}</strong> ({vehicle?.registration_number})? It
            will no longer be dispatchable, and will drop out of the trip-creation vehicle pool.
            This doesn&apos;t delete its history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={handleRetire}
            disabled={retireVehicle.isPending}
          >
            {retireVehicle.isPending && <Loader2 className="animate-spin" />}
            Retire
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
