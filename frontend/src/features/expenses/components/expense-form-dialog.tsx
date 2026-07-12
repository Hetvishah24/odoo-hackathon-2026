"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useVehicles } from "@/features/vehicles/hooks";
import { useTrips } from "@/features/trips/hooks";
import { formatTripLabel } from "@/features/trips/utils";
import { useCreateExpense, useUpdateExpense } from "@/features/expenses/hooks";
import { expenseTypeLabels, expenseTypes } from "@/features/expenses/utils";
import type { ExpenseCreate, ExpenseRead } from "@/features/expenses/types";

const NONE = "none";

const expenseSchema = z.object({
  vehicle_id: z.string(),
  trip_id: z.string(),
  type: z.enum(["toll", "maintenance", "other"]),
  amount: z.coerce.number().min(0, "Can't be negative"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

type ExpenseValues = z.infer<typeof expenseSchema>;

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseRead | null;
}

export function ExpenseFormDialog({ open, onOpenChange, expense }: ExpenseFormDialogProps) {
  const isEdit = Boolean(expense);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const { data: vehicles } = useVehicles({
    page_size: 100,
    sort_by: "registration_number",
    sort_order: "asc",
  });

  const form = useForm<ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      vehicle_id: NONE,
      trip_id: NONE,
      type: "toll",
      amount: 0,
      date: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        vehicle_id: expense?.vehicle_id ? String(expense.vehicle_id) : NONE,
        trip_id: expense?.trip_id ? String(expense.trip_id) : NONE,
        type: expense?.type ?? "toll",
        amount: expense?.amount ?? 0,
        date: expense?.date ?? "",
        description: expense?.description ?? "",
      });
    }
  }, [open, expense, form]);

  const selectedVehicleId = form.watch("vehicle_id");
  const vehicleIdNumber =
    selectedVehicleId && selectedVehicleId !== NONE ? Number(selectedVehicleId) : undefined;

  const { data: trips } = useTrips({
    vehicle_id: vehicleIdNumber,
    page_size: 100,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const onSubmit = async (values: ExpenseValues) => {
    const payload: ExpenseCreate = {
      vehicle_id: values.vehicle_id === NONE ? null : Number(values.vehicle_id),
      trip_id: values.trip_id === NONE ? null : Number(values.trip_id),
      type: values.type,
      amount: values.amount,
      date: values.date,
      description: values.description || null,
    };

    if (isEdit && expense) {
      await updateExpense.mutateAsync({ id: expense.id, payload });
    } else {
      await createExpense.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isPending = createExpense.isPending || updateExpense.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this expense's details."
              : "Record a toll, maintenance, or other fleet expense."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {expenseTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle (optional)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("trip_id", NONE);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Not linked to a vehicle</SelectItem>
                      {vehicles?.items.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.registration_number} — {vehicle.name_model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trip_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!vehicleIdNumber}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={vehicleIdNumber ? "Select a trip" : "Select a vehicle first"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Not linked to a trip</SelectItem>
                      {trips?.items.map((trip) => (
                        <SelectItem key={trip.id} value={String(trip.id)}>
                          {formatTripLabel(trip)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes about this expense" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {isEdit ? "Save changes" : "Add expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
