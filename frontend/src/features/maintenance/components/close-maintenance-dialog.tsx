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
import { useCloseMaintenance } from "@/features/maintenance/hooks";
import type { MaintenanceRead } from "@/features/maintenance/types";
import { vehicleLabel } from "@/features/vehicles/utils";

interface CloseMaintenanceDialogProps {
  log: MaintenanceRead | null;
  vehicleLookup: Map<number, string>;
  onClose: () => void;
}

export function CloseMaintenanceDialog({ log, vehicleLookup, onClose }: CloseMaintenanceDialogProps) {
  const closeMaintenance = useCloseMaintenance();

  const handleClose = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!log) return;
    await closeMaintenance.mutateAsync(log.id);
    onClose();
  };

  return (
    <AlertDialog open={Boolean(log)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this maintenance log?</AlertDialogTitle>
          <AlertDialogDescription>
            {log && `${vehicleLabel(vehicleLookup, log.vehicle_id)} will become Available.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClose} disabled={closeMaintenance.isPending}>
            {closeMaintenance.isPending && <Loader2 className="animate-spin" />}
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
