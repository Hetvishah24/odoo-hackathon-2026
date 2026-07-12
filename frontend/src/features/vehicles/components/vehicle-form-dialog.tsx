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
import { useCreateVehicle, useUpdateVehicle } from "@/features/vehicles/hooks";
import type { VehicleCreate, VehicleRead } from "@/features/vehicles/types";
import { vehicleStatusLabels, vehicleStatuses, vehicleTypes } from "@/features/vehicles/utils";

const vehicleSchema = z.object({
  registration_number: z.string().min(1, "Registration number is required").max(50),
  name_model: z.string().min(1, "Name/model is required").max(255),
  type: z.enum(["truck", "van", "bike", "trailer", "other"]),
  max_load_capacity: z.coerce.number().positive("Must be greater than 0"),
  odometer: z.coerce.number().min(0, "Can't be negative"),
  acquisition_cost: z.coerce.number().min(0, "Can't be negative"),
  revenue_per_km: z.coerce.number().min(0, "Can't be negative"),
  status: z.enum(["available", "on_trip", "in_shop", "retired"]),
  region: z.string().optional(),
});

type VehicleValues = z.infer<typeof vehicleSchema>;

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: VehicleRead | null;
}

export function VehicleFormDialog({ open, onOpenChange, vehicle }: VehicleFormDialogProps) {
  const isEdit = Boolean(vehicle);
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const form = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registration_number: "",
      name_model: "",
      type: "van",
      max_load_capacity: 0,
      odometer: 0,
      acquisition_cost: 0,
      revenue_per_km: 0,
      status: "available",
      region: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        registration_number: vehicle?.registration_number ?? "",
        name_model: vehicle?.name_model ?? "",
        type: vehicle?.type ?? "van",
        max_load_capacity: vehicle?.max_load_capacity ?? 0,
        odometer: vehicle?.odometer ?? 0,
        acquisition_cost: vehicle?.acquisition_cost ?? 0,
        revenue_per_km: vehicle?.revenue_per_km ?? 0,
        status: vehicle?.status ?? "available",
        region: vehicle?.region ?? "",
      });
    }
  }, [open, vehicle, form]);

  const onSubmit = async (values: VehicleValues) => {
    const payload: VehicleCreate = {
      registration_number: values.registration_number,
      name_model: values.name_model,
      type: values.type,
      max_load_capacity: values.max_load_capacity,
      odometer: values.odometer,
      acquisition_cost: values.acquisition_cost,
      revenue_per_km: values.revenue_per_km,
      status: values.status,
      region: values.region || null,
    };

    if (isEdit && vehicle) {
      await updateVehicle.mutateAsync({ id: vehicle.id, payload });
    } else {
      await createVehicle.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isPending = createVehicle.isPending || updateVehicle.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Vehicle" : "New Vehicle"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update vehicle details." : "Add a vehicle to the fleet registry."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration No.</FormLabel>
                    <FormControl>
                      <Input placeholder="MH-04-AB-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name / Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Tata Ace" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {vehicleStatusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="max_load_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max load capacity (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odometer (km)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="acquisition_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acquisition cost</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="revenue_per_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue / km</FormLabel>
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
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="Mumbai" {...field} />
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
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
