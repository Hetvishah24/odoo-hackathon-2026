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
import { useOpenMaintenance } from "@/features/maintenance/hooks";
import type { MaintenanceCreate } from "@/features/maintenance/types";

function nowForDatetimeLocal(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

const openSchema = z.object({
  vehicle_id: z.coerce.number({ message: "Select a vehicle" }).positive("Select a vehicle"),
  description: z.string().min(1, "Description is required"),
  cost: z.coerce.number().min(0, "Can't be negative"),
  opened_at: z.string().min(1, "Opened date is required"),
});

type OpenValues = z.infer<typeof openSchema>;

interface MaintenanceOpenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaintenanceOpenDialog({ open, onOpenChange }: MaintenanceOpenDialogProps) {
  const { data: vehicles } = useVehicles({ page: 1, page_size: 100, sort_by: "registration_number" });
  const openMaintenance = useOpenMaintenance();

  // Belt + suspenders: retired vehicles are hidden here client-side, but the server still
  // rejects with 409 in case of a race (e.g. someone else retires it right after we load).
  const eligibleVehicles = (vehicles?.items ?? []).filter((v) => v.status !== "retired");

  const form = useForm<OpenValues>({
    resolver: zodResolver(openSchema),
    defaultValues: {
      vehicle_id: undefined,
      description: "",
      cost: 0,
      opened_at: nowForDatetimeLocal(),
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        vehicle_id: undefined,
        description: "",
        cost: 0,
        opened_at: nowForDatetimeLocal(),
      });
    }
  }, [open, form]);

  const onSubmit = async (values: OpenValues) => {
    const payload: MaintenanceCreate = {
      vehicle_id: values.vehicle_id,
      description: values.description,
      cost: values.cost,
      opened_at: new Date(values.opened_at).toISOString(),
    };
    await openMaintenance.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open Maintenance</DialogTitle>
          <DialogDescription>
            Sets the vehicle to &quot;In Shop&quot; until this log is closed.
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
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                            {vehicle.registration_number} · {vehicle.name_model}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brake pad replacement" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="opened_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opened at</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={openMaintenance.isPending}>
                {openMaintenance.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Open maintenance
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
