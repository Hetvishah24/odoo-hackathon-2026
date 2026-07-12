"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getErrorMessage } from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth-context";
import { useDriver } from "@/features/drivers/hooks";
import { useVehicle } from "@/features/vehicles/hooks";
import { TripCancelDialog } from "@/features/trips/components/trip-cancel-dialog";
import { TripCompleteDialog } from "@/features/trips/components/trip-complete-dialog";
import { TripFormDialog } from "@/features/trips/components/trip-form-dialog";
import { TripLifecycleStepper } from "@/features/trips/components/trip-lifecycle-stepper";
import { TripStatusBadge } from "@/features/trips/components/trip-status-badge";
import { useDispatchTrip, useTrip } from "@/features/trips/hooks";

function tripLabel(id: number): string {
  return `TR-${String(id).padStart(3, "0")}`;
}

export function TripDetail({ tripId }: { tripId: number }) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("trips:write");

  const { data: trip, isLoading, isError, error } = useTrip(tripId);
  const { data: vehicle } = useVehicle(trip?.vehicle_id ?? null);
  const { data: driver } = useDriver(trip?.driver_id ?? null);

  const dispatchTrip = useDispatchTrip();
  const [formOpen, setFormOpen] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&apos;t load this trip</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/trips")}>
          <ArrowLeft />
          <span className="sr-only">Back to trips</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{tripLabel(trip.id)}</h1>
          <p className="text-sm text-muted-foreground">
            {trip.source} → {trip.destination}
          </p>
        </div>
        <TripStatusBadge status={trip.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Trip lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TripLifecycleStepper trip={trip} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{vehicle?.registration_number ?? `V${trip.vehicle_id}`}</p>
            {vehicle && (
              <p className="text-sm text-muted-foreground">
                {vehicle.name_model} · {vehicle.max_load_capacity} kg capacity
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{driver?.name ?? `D${trip.driver_id}`}</p>
            {driver && <p className="text-sm text-muted-foreground">{driver.contact_number}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Cargo weight</p>
            <p className="font-medium">{trip.cargo_weight} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Planned distance</p>
            <p className="font-medium">{trip.planned_distance} km</p>
          </div>
          <div>
            <p className="text-muted-foreground">Actual distance</p>
            <p className="font-medium">{trip.actual_distance ?? "—"} km</p>
          </div>
          <div>
            <p className="text-muted-foreground">Start odometer</p>
            <p className="font-medium">{trip.start_odometer ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End odometer</p>
            <p className="font-medium">{trip.end_odometer ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fuel consumed</p>
            <p className="font-medium">{trip.fuel_consumed ?? "—"} L</p>
          </div>
        </CardContent>
      </Card>

      {canWrite && (trip.status === "draft" || trip.status === "dispatched") && (
        <div className="flex gap-2">
          {trip.status === "draft" && (
            <>
              <Button variant="outline" onClick={() => setFormOpen(true)}>
                Edit
              </Button>
              <Button
                disabled={dispatchTrip.isPending}
                onClick={() => dispatchTrip.mutate(trip.id)}
              >
                Dispatch
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setCancelling(true)}
              >
                Cancel
              </Button>
            </>
          )}
          {trip.status === "dispatched" && (
            <>
              <Button onClick={() => setCompleting(true)}>Complete</Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setCancelling(true)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}

      <TripFormDialog open={formOpen} onOpenChange={setFormOpen} trip={trip} />
      <TripCompleteDialog trip={completing ? trip : null} onClose={() => setCompleting(false)} />
      <TripCancelDialog trip={cancelling ? trip : null} onClose={() => setCancelling(false)} />
    </div>
  );
}
