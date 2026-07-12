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
import { useVehicles } from "@/features/vehicles/hooks";
import { useTrips } from "@/features/trips/hooks";
import { formatTripLabel } from "@/features/trips/utils";
import { useCreateFuelLog, useUpdateFuelLog } from "@/features/fuel-logs/hooks";
import type { FuelLogCreate, FuelLogRead } from "@/features/fuel-logs/types";

const NONE = "none";

const fuelLogSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required"),
  trip_id: z.string(),
  liters: z.coerce.number().positive("Must be greater than 0"),
  cost: z.coerce.number().min(0, "Can't be negative"),
  date: z.string().min(1, "Date is required"),
});

type FuelLogValues = z.infer<typeof fuelLogSchema>;

interface FuelLogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fuelLog?: FuelLogRead | null;
}

export function FuelLogFormDialog({ open, onOpenChange, fuelLog }: FuelLogFormDialogProps) {
  const isEdit = Boolean(fuelLog);
  const createFuelLog = useCreateFuelLog();
  const updateFuelLog = useUpdateFuelLog();

  const { data: vehicles } = useVehicles({
    page_size: 100,
    sort_by: "registration_number",
    sort_order: "asc",
  });

  const form = useForm<FuelLogValues>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      vehicle_id: "",
      trip_id: NONE,
      liters: 0,
      cost: 0,
      date: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        vehicle_id: fuelLog ? String(fuelLog.vehicle_id) : "",
        trip_id: fuelLog?.trip_id ? String(fuelLog.trip_id) : NONE,
        liters: fuelLog?.liters ?? 0,
        cost: fuelLog?.cost ?? 0,
        date: fuelLog?.date ?? "",
      });
    }
  }, [open, fuelLog, form]);

  const selectedVehicleId = form.watch("vehicle_id");
  const vehicleIdNumber = selectedVehicleId ? Number(selectedVehicleId) : undefined;

  const { data: trips } = useTrips({
    vehicle_id: vehicleIdNumber,
    page_size: 100,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const onSubmit = async (values: FuelLogValues) => {
    const payload: FuelLogCreate = {
      vehicle_id: Number(values.vehicle_id),
      trip_id: values.trip_id === NONE ? null : Number(values.trip_id),
      liters: values.liters,
      cost: values.cost,
      date: values.date,
    };

    if (isEdit && fuelLog) {
      await updateFuelLog.mutateAsync({ id: fuelLog.id, payload });
    } else {
      await createFuelLog.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isPending = createFuelLog.isPending || updateFuelLog.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Fuel Log" : "Log Fuel"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this fuel log's details." : "Record a fuel fill-up for a vehicle."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
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
                    disabled={!selectedVehicleId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={selectedVehicleId ? "Select a trip" : "Select a vehicle first"}
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
                name="liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liters</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {isEdit ? "Save changes" : "Log fuel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
