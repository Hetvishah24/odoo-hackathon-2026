"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";

import { getErrorMessage } from "@/lib/api-client";
import { useDebounce } from "@/lib/use-debounce";
import { getInitials } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { DriverFormDialog } from "@/features/drivers/components/driver-form-dialog";
import { useDeleteDriver, useDrivers, useExpiringDrivers } from "@/features/drivers/hooks";
import type { DriverRead, DriverStatus } from "@/features/drivers/types";
import {
  DRIVER_STATUSES,
  filterDrivers,
  formatLicenseExpiry,
  formatStatusLabel,
  getExpiryBadge,
  getExpiryClassName,
  getExpiryTone,
  getSafetyBarClass,
  getStatusBadgeClass,
  maskContactNumber,
} from "@/features/drivers/utils";

const PAGE_SIZE = 10;
const COLUMN_COUNT = 8;

export function DriversTable() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("drivers:write");

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebounce(searchInput);
  const [statusFilter, setStatusFilter] = React.useState<DriverStatus | undefined>(undefined);
  const [regionFilter, setRegionFilter] = React.useState("");
  const region = useDebounce(regionFilter);
  const [expiringOnly, setExpiringOnly] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingDriver, setEditingDriver] = React.useState<DriverRead | null>(null);
  const [deletingDriver, setDeletingDriver] = React.useState<DriverRead | null>(null);
  const [confirmText, setConfirmText] = React.useState("");

  const { data, isLoading, isError, error } = useDrivers({
    page,
    page_size: PAGE_SIZE,
    search: expiringOnly ? undefined : search || undefined,
    sort_by: "created_at",
    sort_order: "desc",
    status: expiringOnly ? undefined : statusFilter,
    region: expiringOnly ? undefined : region || undefined,
  });

  const {
    data: expiringData,
    isLoading: expiringLoading,
    isError: expiringError,
    error: expiringQueryError,
  } = useExpiringDrivers(30);

  const deleteDriver = useDeleteDriver();

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, region, expiringOnly]);

  const displayedDrivers = React.useMemo(() => {
    if (!expiringOnly) return data?.items ?? [];
    return filterDrivers(expiringData ?? [], {
      search,
      status: statusFilter,
      region,
    });
  }, [data?.items, expiringData, expiringOnly, region, search, statusFilter]);

  const openEdit = (driver: DriverRead) => {
    setEditingDriver(driver);
    setFormOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeletingDriver(null);
    setConfirmText("");
  };

  const toggleStatusFilter = (status: DriverStatus) => {
    setStatusFilter((current) => (current === status ? undefined : status));
  };

  if (isError && !expiringOnly) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load drivers</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  if (expiringOnly && expiringError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load expiring licenses</AlertTitle>
        <AlertDescription>{getErrorMessage(expiringQueryError)}</AlertDescription>
      </Alert>
    );
  }

  const loading = expiringOnly ? expiringLoading : isLoading;
  const totalColumns = canWrite ? COLUMN_COUNT + 1 : COLUMN_COUNT;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or license..."
              className="pl-9"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <Select
            value={statusFilter ?? "all"}
            onValueChange={(value) =>
              setStatusFilter(value === "all" ? undefined : (value as DriverStatus))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {DRIVER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Region"
            className="w-36"
            value={regionFilter}
            onChange={(event) => setRegionFilter(event.target.value)}
          />

          <Button
            type="button"
            variant={expiringOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setExpiringOnly((value) => !value)}
          >
            Expiring soon
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {DRIVER_STATUSES.map((status) => (
          <Button
            key={status.value}
            type="button"
            size="sm"
            variant={statusFilter === status.value ? "default" : "outline"}
            className={
              statusFilter === status.value
                ? getStatusBadgeClass(status.value)
                : "border-border text-muted-foreground"
            }
            onClick={() => toggleStatusFilter(status.value)}
          >
            {status.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>License No.</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Safety</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Region</TableHead>
              {canWrite && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  {canWrite && <TableCell />}
                </TableRow>
              ))
            ) : displayedDrivers.length > 0 ? (
              displayedDrivers.map((driver) => {
                const expiryBadge = getExpiryBadge(driver.license_expiry_date);

                return (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">
                            {getInitials(driver.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{driver.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{driver.license_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {driver.license_category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={getExpiryClassName(driver.license_expiry_date)}>
                          {formatLicenseExpiry(driver.license_expiry_date)}
                        </span>
                        {expiryBadge && (
                          <Badge
                            variant="outline"
                            className={
                              getExpiryTone(driver.license_expiry_date) === "expired"
                                ? "border-destructive/30 bg-destructive/10 text-destructive"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            }
                          >
                            {expiryBadge}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {maskContactNumber(driver.contact_number)}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-[88px] items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${getSafetyBarClass(driver.safety_score)}`}
                            style={{ width: `${Math.min(100, Math.max(0, driver.safety_score))}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-medium tabular-nums">
                          {Math.round(driver.safety_score)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${getStatusBadgeClass(driver.status)}`}
                      >
                        {formatStatusLabel(driver.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{driver.region ?? "—"}</TableCell>
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
                            <DropdownMenuItem onClick={() => openEdit(driver)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeletingDriver(driver)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={totalColumns} className="h-24 text-center text-muted-foreground">
                  {expiringOnly
                    ? "No drivers with expiring licenses match your filters."
                    : "Drivers appear here once they register and complete onboarding."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!expiringOnly && data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.pages} · {data.total} drivers
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

      {expiringOnly && displayedDrivers.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {displayedDrivers.length} driver{displayedDrivers.length === 1 ? "" : "s"} with
          licenses expiring within 30 days.
        </p>
      )}


      <DriverFormDialog open={formOpen} onOpenChange={setFormOpen} driver={editingDriver} />

      {deletingDriver && (
        <Dialog open onOpenChange={(open) => !open && closeDeleteDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete driver</DialogTitle>
              <DialogDescription>
                This permanently removes {deletingDriver.name} and cannot be undone. Type the
                driver&apos;s full name to confirm.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Type full name to confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmText !== deletingDriver.name || deleteDriver.isPending}
                onClick={async () => {
                  await deleteDriver.mutateAsync(deletingDriver.id);
                  closeDeleteDialog();
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
