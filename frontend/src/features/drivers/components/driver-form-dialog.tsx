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
import type { DriverRead, DriverUpdate } from "@/features/drivers/types";
import { useUpdateDriver } from "@/features/drivers/hooks";

const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  license_number: z.string().min(1, "License number is required"),
  license_category: z.string().min(1, "Category is required"),
  license_expiry_date: z.string().min(1, "Expiry date is required"),
  contact_number: z.string().min(1, "Contact number is required"),
  safety_score: z.number().min(0).max(100).optional(),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]),
  region: z.string().optional(),
});

type DriverValues = z.infer<typeof driverSchema>;

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: DriverRead | null;
}

const statuses = ["available", "on_trip", "off_duty", "suspended"] as const;

export function DriverFormDialog({ open, onOpenChange, driver }: DriverFormDialogProps) {
  const isEdit = Boolean(driver);
  const updateDriver = useUpdateDriver();

  const form = useForm<DriverValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      license_number: "",
      license_category: "",
      license_expiry_date: "",
      contact_number: "",
      safety_score: 100,
      status: "available",
      region: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: driver?.name ?? "",
        license_number: driver?.license_number ?? "",
        license_category: driver?.license_category ?? "",
        license_expiry_date: driver?.license_expiry_date ?? "",
        contact_number: driver?.contact_number ?? "",
        safety_score: driver?.safety_score ?? 100,
        status: driver?.status ?? "available",
        region: driver?.region ?? "",
      });
    }
  }, [open, driver, form]);

  const onSubmit = async (values: DriverValues) => {
    const payload = {
      name: values.name,
      license_number: values.license_number,
      license_category: values.license_category,
      license_expiry_date: values.license_expiry_date,
      contact_number: values.contact_number,
      safety_score: values.safety_score,
      status: values.status,
      region: values.region || null,
    };

    if (isEdit && driver) {
      await updateDriver.mutateAsync({ id: driver.id, payload });
    } else {
      // Creation of drivers is handled via onboarding; close the dialog.
      // Do not attempt to create drivers from this UI.
    }
    onOpenChange(false);
  };

  const isPending = updateDriver.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription>Update driver details.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {driver && driver.user_id == null && (
              <div className="rounded-md border bg-muted p-2 text-sm text-muted-foreground">No linked user account.</div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License No.</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="license_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="license_expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry date</FormLabel>
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
              name="contact_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="safety_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                        }
                      />
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
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace("_", " ")}
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
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
              <Button type="submit" disabled={isPending || !isEdit}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
