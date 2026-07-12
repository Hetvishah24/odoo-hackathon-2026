"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { useDispatchableDrivers } from "@/features/drivers/hooks";
import { useDispatchableVehicles } from "@/features/vehicles/hooks";
import { useCreateTrip, useUpdateTrip } from "@/features/trips/hooks";
import type { TripRead } from "@/features/trips/types";

const tripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicle_id: z.string().min(1, "Vehicle is required"),
  driver_id: z.string().min(1, "Driver is required"),
  cargo_weight: z.coerce.number().gt(0, "Cargo weight must be greater than 0"),
  planned_distance: z.coerce.number().gt(0, "Planned distance must be greater than 0"),
});

type TripValues = z.infer<typeof tripSchema>;

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing a draft trip; absent when creating. */
  trip?: TripRead | null;
}

export function TripFormDialog({ open, onOpenChange, trip }: TripFormDialogProps) {
  const isEdit = Boolean(trip);
  const { data: vehicles } = useDispatchableVehicles();
  const { data: drivers } = useDispatchableDrivers();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();

  const form = useForm<TripValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      source: "",
      destination: "",
      vehicle_id: "",
      driver_id: "",
      cargo_weight: 0,
      planned_distance: 0,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        source: trip?.source ?? "",
        destination: trip?.destination ?? "",
        vehicle_id: trip ? String(trip.vehicle_id) : "",
        driver_id: trip ? String(trip.driver_id) : "",
        cargo_weight: trip?.cargo_weight ?? 0,
        planned_distance: trip?.planned_distance ?? 0,
      });
    }
  }, [open, trip, form]);

  const selectedVehicleId = form.watch("vehicle_id");
  const cargoWeight = Number(form.watch("cargo_weight")) || 0;
  const selectedVehicle = vehicles?.find((vehicle) => String(vehicle.id) === selectedVehicleId);
  const capacityExceeded = selectedVehicle != null && cargoWeight > selectedVehicle.max_load_capacity;

  const onSubmit = async (values: TripValues) => {
    if (selectedVehicle && values.cargo_weight > selectedVehicle.max_load_capacity) {
      form.setError("cargo_weight", { message: "Exceeds vehicle capacity" });
      return;
    }

    const payload = {
      source: values.source,
      destination: values.destination,
      vehicle_id: Number(values.vehicle_id),
      driver_id: Number(values.driver_id),
      cargo_weight: values.cargo_weight,
      planned_distance: values.planned_distance,
    };

    if (isEdit && trip) {
      await updateTrip.mutateAsync({ id: trip.id, payload });
    } else {
      await createTrip.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isPending = createTrip.isPending || updateTrip.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit trip" : "Create trip"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this draft trip's details."
              : "Vehicle and driver lists only show currently available options."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle (available only)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles?.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.registration_number} — {vehicle.max_load_capacity} kg capacity
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
              name="driver_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver (available only)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {drivers?.map((driver) => (
                        <SelectItem key={driver.id} value={String(driver.id)}>
                          {driver.name}
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
                name="cargo_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="planned_distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned distance (km)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {selectedVehicle && (
              <Alert variant={capacityExceeded ? "destructive" : "default"}>
                <AlertTitle>Vehicle capacity: {selectedVehicle.max_load_capacity} kg</AlertTitle>
                <AlertDescription>
                  {capacityExceeded
                    ? `Cargo weight ${cargoWeight} kg exceeds capacity by ${(
                        cargoWeight - selectedVehicle.max_load_capacity
                      ).toFixed(0)} kg — dispatch blocked.`
                    : `Cargo weight ${cargoWeight} kg fits within capacity.`}
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || capacityExceeded}>
                {isPending && <Loader2 className="animate-spin" />}
                {isEdit ? "Save changes" : "Create trip"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
