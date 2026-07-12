"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search, Truck } from "lucide-react";

import { getErrorMessage } from "@/lib/api-client";
import { useDebounce } from "@/lib/use-debounce";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useVehicles } from "@/features/vehicles/hooks";
import { VehicleFormDialog } from "@/features/vehicles/components/vehicle-form-dialog";
import { RetireVehicleDialog } from "@/features/vehicles/components/retire-vehicle-dialog";
import type { VehicleRead, VehicleStatus, VehicleType } from "@/features/vehicles/types";
import {
  formatNumber,
  vehicleStatusLabels,
  vehicleStatusStyles,
  vehicleStatuses,
  vehicleTypes,
} from "@/features/vehicles/utils";

const PAGE_SIZE = 10;
const ALL = "all";

export function VehiclesTable() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("vehicles:write");

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebounce(searchInput);
  const [statusFilter, setStatusFilter] = React.useState<VehicleStatus | typeof ALL>(ALL);
  const [typeFilter, setTypeFilter] = React.useState<VehicleType | typeof ALL>(ALL);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] = React.useState<VehicleRead | null>(null);
  const [retiringVehicle, setRetiringVehicle] = React.useState<VehicleRead | null>(null);

  const { data, isLoading, isError, error } = useVehicles({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter === ALL ? undefined : statusFilter,
    type: typeFilter === ALL ? undefined : typeFilter,
    sort_by: "created_at",
    sort_order: "desc",
  });

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  const openCreate = () => {
    setEditingVehicle(null);
    setFormOpen(true);
  };

  const openEdit = (vehicle: VehicleRead) => {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  };

  const hasFilters = Boolean(search) || statusFilter !== ALL || typeFilter !== ALL;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load vehicles</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as VehicleType | typeof ALL)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {vehicleTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as VehicleStatus | typeof ALL)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {vehicleStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {vehicleStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reg. no. or model..."
              className="pl-9"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
        </div>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus />
            Add vehicle
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reg. No.</TableHead>
              <TableHead>Name / Model</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Acq. Cost</TableHead>
              <TableHead>Status</TableHead>
              {canWrite && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  {canWrite && <TableCell />}
                </TableRow>
              ))
            ) : data && data.items.length > 0 ? (
              data.items.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.registration_number}</TableCell>
                  <TableCell>{vehicle.name_model}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {vehicle.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatNumber(vehicle.max_load_capacity)} kg</TableCell>
                  <TableCell>{formatNumber(vehicle.odometer)} km</TableCell>
                  <TableCell>₹{formatNumber(vehicle.acquisition_cost)}</TableCell>
                  <TableCell>
                    <Badge className={vehicleStatusStyles[vehicle.status]}>
                      {vehicleStatusLabels[vehicle.status]}
                    </Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(vehicle)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            disabled={vehicle.status === "retired"}
                            onClick={() => setRetiringVehicle(vehicle)}
                          >
                            Retire
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canWrite ? 8 : 7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Truck className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {hasFilters ? "No vehicles match your filters." : "No vehicles yet."}
                      </p>
                      {!hasFilters && (
                        <p className="text-sm text-muted-foreground">
                          Add a vehicle to start building your fleet registry.
                        </p>
                      )}
                    </div>
                    {canWrite && !hasFilters && (
                      <Button onClick={openCreate} className="mt-1">
                        <Plus />
                        Add your first vehicle
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.pages} · {data.total} vehicles
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeft />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((current) => current + 1)}>
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} vehicle={editingVehicle} />
      <RetireVehicleDialog vehicle={retiringVehicle} onClose={() => setRetiringVehicle(null)} />
    </div>
  );
}
