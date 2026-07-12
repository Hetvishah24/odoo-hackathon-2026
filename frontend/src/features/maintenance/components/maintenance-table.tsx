"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus, Wrench } from "lucide-react";

import { getErrorMessage } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useVehicleLookup, vehicleLabel, vehicleStatusLabels, vehicleStatusStyles } from "@/features/vehicles/utils";
import { useMaintenanceLogs } from "@/features/maintenance/hooks";
import { maintenanceStatusLabels, maintenanceStatusStyles } from "@/features/maintenance/utils";
import { MaintenanceOpenDialog } from "@/features/maintenance/components/maintenance-open-dialog";
import { CloseMaintenanceDialog } from "@/features/maintenance/components/close-maintenance-dialog";
import type { MaintenanceRead, MaintenanceStatus } from "@/features/maintenance/types";

const PAGE_SIZE = 10;
const ALL = "all";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MaintenanceTable() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("maintenance:write");

  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<MaintenanceStatus | typeof ALL>("open");
  const [vehicleFilter, setVehicleFilter] = React.useState<number | typeof ALL>(ALL);

  const [openDialogOpen, setOpenDialogOpen] = React.useState(false);
  const [closingLog, setClosingLog] = React.useState<MaintenanceRead | null>(null);

  const { data, isLoading, isError, error } = useMaintenanceLogs({
    page,
    page_size: PAGE_SIZE,
    status: statusFilter === ALL ? undefined : statusFilter,
    vehicle_id: vehicleFilter === ALL ? undefined : vehicleFilter,
    // Open items are the actionable ones - default sort surfaces them first.
    sort_by: "status",
    sort_order: "asc",
  });

  const { data: vehicles } = useVehicles({ page: 1, page_size: 100, sort_by: "registration_number" });
  const vehicleLookup = useVehicleLookup();
  const vehicleStatusById = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const v of vehicles?.items ?? []) map.set(v.id, v.status);
    return map;
  }, [vehicles]);

  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, vehicleFilter]);

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load maintenance logs</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as MaintenanceStatus | typeof ALL)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="open">{maintenanceStatusLabels.open}</SelectItem>
              <SelectItem value="closed">{maintenanceStatusLabels.closed}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={String(vehicleFilter)}
            onValueChange={(value) => setVehicleFilter(value === ALL ? ALL : Number(value))}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All vehicles</SelectItem>
              {vehicles?.items.map((vehicle) => (
                <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                  {vehicle.registration_number} · {vehicle.name_model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canWrite && (
          <Button onClick={() => setOpenDialogOpen(true)}>
            <Plus />
            Open maintenance
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Closed</TableHead>
              <TableHead>Status</TableHead>
              {canWrite && <TableHead className="w-[120px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  {canWrite && <TableCell />}
                </TableRow>
              ))
            ) : data && data.items.length > 0 ? (
              data.items.map((log) => {
                const vehicleStatus = vehicleStatusById.get(log.vehicle_id);
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {vehicleLabel(vehicleLookup, log.vehicle_id)}
                        {vehicleStatus && log.status === "open" && (
                          <Badge
                            variant="outline"
                            className={vehicleStatusStyles[vehicleStatus as keyof typeof vehicleStatusStyles]}
                          >
                            {vehicleStatusLabels[vehicleStatus as keyof typeof vehicleStatusLabels]}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate" title={log.description}>
                      {log.description}
                    </TableCell>
                    <TableCell>{formatCurrency(log.cost)}</TableCell>
                    <TableCell>{formatDateTime(log.opened_at)}</TableCell>
                    <TableCell>{log.closed_at ? formatDateTime(log.closed_at) : "—"}</TableCell>
                    <TableCell>
                      <Badge className={maintenanceStatusStyles[log.status]}>
                        {maintenanceStatusLabels[log.status]}
                      </Badge>
                    </TableCell>
                    {canWrite && (
                      <TableCell>
                        {log.status === "open" && (
                          <Button variant="outline" size="sm" onClick={() => setClosingLog(log)}>
                            Close
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={canWrite ? 7 : 6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Wrench className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">No maintenance logs found.</p>
                    {canWrite && (
                      <Button onClick={() => setOpenDialogOpen(true)} className="mt-1">
                        <Plus />
                        Open your first maintenance log
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
            Page {data.page} of {data.pages} · {data.total} logs
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

      <MaintenanceOpenDialog open={openDialogOpen} onOpenChange={setOpenDialogOpen} />
      <CloseMaintenanceDialog log={closingLog} vehicleLookup={vehicleLookup} onClose={() => setClosingLog(null)} />
    </div>
  );
}
