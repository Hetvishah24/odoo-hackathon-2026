"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

import { getErrorMessage } from "@/lib/api-client";
import { useDebounce } from "@/lib/use-debounce";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/auth-context";
import { useDrivers } from "@/features/drivers/hooks";
import { useVehicles } from "@/features/vehicles/hooks";
import { TripCancelDialog } from "@/features/trips/components/trip-cancel-dialog";
import { TripCompleteDialog } from "@/features/trips/components/trip-complete-dialog";
import { TripFormDialog } from "@/features/trips/components/trip-form-dialog";
import { TripStatusBadge } from "@/features/trips/components/trip-status-badge";
import { useDispatchTrip, useTrips } from "@/features/trips/hooks";
import type { TripRead, TripStatus } from "@/features/trips/types";

const PAGE_SIZE = 10;
const STATUS_OPTIONS: TripStatus[] = ["draft", "dispatched", "completed", "cancelled"];

function tripLabel(trip: TripRead): string {
  return `TR-${String(trip.id).padStart(3, "0")}`;
}

function formatTripDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TripsTable() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("trips:write");

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebounce(searchInput);
  const [status, setStatus] = React.useState<TripStatus | "all">("all");
  const [vehicleId, setVehicleId] = React.useState<string>("all");
  const [driverId, setDriverId] = React.useState<string>("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingTrip, setEditingTrip] = React.useState<TripRead | null>(null);
  const [completingTrip, setCompletingTrip] = React.useState<TripRead | null>(null);
  const [cancellingTrip, setCancellingTrip] = React.useState<TripRead | null>(null);

  const { data: vehiclesPage } = useVehicles({ page_size: 100 });
  const { data: driversPage } = useDrivers({ page_size: 100 });
  const vehicleLookup = React.useMemo(
    () => new Map(vehiclesPage?.items.map((vehicle) => [vehicle.id, vehicle.registration_number])),
    [vehiclesPage]
  );
  const driverLookup = React.useMemo(
    () => new Map(driversPage?.items.map((driver) => [driver.id, driver.name])),
    [driversPage]
  );

  const { data, isError, error, isLoading } = useTrips({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    vehicle_id: vehicleId === "all" ? undefined : Number(vehicleId),
    driver_id: driverId === "all" ? undefined : Number(driverId),
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const dispatchTrip = useDispatchTrip();

  React.useEffect(() => {
    setPage(1);
  }, [search, status, vehicleId, driverId, dateFrom, dateTo]);

  const openCreate = () => {
    setEditingTrip(null);
    setFormOpen(true);
  };

  const openEdit = (trip: TripRead) => {
    setEditingTrip(trip);
    setFormOpen(true);
  };

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load trips</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search source or destination..."
              className="pl-9"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          {canWrite && (
            <Button onClick={openCreate}>
              <Plus />
              Create trip
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(value) => setStatus(value as TripStatus | "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vehicles</SelectItem>
              {vehiclesPage?.items.map((vehicle) => (
                <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                  {vehicle.registration_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={driverId} onValueChange={setDriverId}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All drivers</SelectItem>
              {driversPage?.items.map((driver) => (
                <SelectItem key={driver.id} value={String(driver.id)}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            className="w-[150px]"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
          <Input
            type="date"
            className="w-[150px]"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              {canWrite && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  {canWrite && <TableCell />}
                </TableRow>
              ))
            ) : data && data.items.length > 0 ? (
              data.items.map((trip) => (
                <TableRow
                  key={trip.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/trips/${trip.id}`)}
                >
                  <TableCell className="font-medium">{tripLabel(trip)}</TableCell>
                  <TableCell>{formatTripDate(trip.created_at)}</TableCell>
                  <TableCell>
                    {trip.source} → {trip.destination}
                  </TableCell>
                  <TableCell>{vehicleLookup.get(trip.vehicle_id) ?? `V${trip.vehicle_id}`}</TableCell>
                  <TableCell>{driverLookup.get(trip.driver_id) ?? `D${trip.driver_id}`}</TableCell>
                  <TableCell>
                    <TripStatusBadge status={trip.status} />
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        {trip.status === "draft" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openEdit(trip)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              disabled={dispatchTrip.isPending}
                              onClick={() => dispatchTrip.mutate(trip.id)}
                            >
                              Dispatch
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setCancellingTrip(trip)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {trip.status === "dispatched" && (
                          <>
                            <Button size="sm" onClick={() => setCompletingTrip(trip)}>
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setCancellingTrip(trip)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canWrite ? 7 : 6} className="h-24 text-center text-muted-foreground">
                  No trips found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.pages} · {data.total} trips
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      <TripFormDialog open={formOpen} onOpenChange={setFormOpen} trip={editingTrip} />
      <TripCompleteDialog trip={completingTrip} onClose={() => setCompletingTrip(null)} />
      <TripCancelDialog trip={cancellingTrip} onClose={() => setCancellingTrip(null)} />
    </div>
  );
}
