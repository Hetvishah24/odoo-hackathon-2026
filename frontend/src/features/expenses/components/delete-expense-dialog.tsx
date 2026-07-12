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
import { useDeleteExpense } from "@/features/expenses/hooks";
import type { ExpenseRead } from "@/features/expenses/types";

interface DeleteExpenseDialogProps {
  expense: ExpenseRead | null;
  onClose: () => void;
}

export function DeleteExpenseDialog({ expense, onClose }: DeleteExpenseDialogProps) {
  const deleteExpense = useDeleteExpense();

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!expense) return;
    await deleteExpense.mutateAsync(expense.id);
    onClose();
  };

  return (
    <AlertDialog open={Boolean(expense)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete expense</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes this expense and cannot be undone. It will also disappear
            from any related operational cost reports.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={handleDelete}
            disabled={deleteExpense.isPending}
          >
            {deleteExpense.isPending && <Loader2 className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
