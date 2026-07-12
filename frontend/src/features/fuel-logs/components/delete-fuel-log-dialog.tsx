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
import { useDeleteFuelLog } from "@/features/fuel-logs/hooks";
import type { FuelLogRead } from "@/features/fuel-logs/types";

interface DeleteFuelLogDialogProps {
  fuelLog: FuelLogRead | null;
  onClose: () => void;
}

export function DeleteFuelLogDialog({ fuelLog, onClose }: DeleteFuelLogDialogProps) {
  const deleteFuelLog = useDeleteFuelLog();

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!fuelLog) return;
    await deleteFuelLog.mutateAsync(fuelLog.id);
    onClose();
  };

  return (
    <AlertDialog open={Boolean(fuelLog)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete fuel log</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes this fuel log and cannot be undone. It will also disappear
            from any related fuel-efficiency and operational cost reports.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={handleDelete}
            disabled={deleteFuelLog.isPending}
          >
            {deleteFuelLog.isPending && <Loader2 className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
