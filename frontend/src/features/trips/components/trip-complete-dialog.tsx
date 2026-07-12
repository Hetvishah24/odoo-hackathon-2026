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
import { useCompleteTrip } from "@/features/trips/hooks";
import type { TripRead } from "@/features/trips/types";

const completeSchema = z.object({
  end_odometer: z.coerce.number().min(0, "Must be 0 or greater"),
  fuel_consumed: z.coerce.number().min(0, "Must be 0 or greater"),
  actual_distance: z.coerce.number().min(0, "Must be 0 or greater"),
});

type CompleteValues = z.infer<typeof completeSchema>;

interface TripCompleteDialogProps {
  trip: TripRead | null;
  onClose: () => void;
}

function suggestedEndOdometer(trip: TripRead | null): number {
  if (!trip || trip.start_odometer == null) return 0;
  return trip.start_odometer + trip.planned_distance;
}

export function TripCompleteDialog({ trip, onClose }: TripCompleteDialogProps) {
  const completeTrip = useCompleteTrip();

  const form = useForm<CompleteValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { end_odometer: 0, fuel_consumed: 0, actual_distance: 0 },
  });

  React.useEffect(() => {
    if (trip) {
      form.reset({
        end_odometer: suggestedEndOdometer(trip),
        fuel_consumed: 0,
        actual_distance: trip.planned_distance,
      });
    }
  }, [trip, form]);

  const onSubmit = async (values: CompleteValues) => {
    if (!trip) return;
    await completeTrip.mutateAsync({ id: trip.id, payload: values });
    onClose();
  };

  return (
    <Dialog open={Boolean(trip)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete trip</DialogTitle>
          <DialogDescription>
            Enter the final odometer reading and fuel consumed to close out {trip?.source} →{" "}
            {trip?.destination}. End odometer is pre-filled from start odometer + planned
            distance — adjust if it differs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="end_odometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End odometer</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="actual_distance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actual distance (km)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fuel_consumed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel consumed (L)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={completeTrip.isPending}>
                {completeTrip.isPending && <Loader2 className="animate-spin" />}
                Complete trip
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
