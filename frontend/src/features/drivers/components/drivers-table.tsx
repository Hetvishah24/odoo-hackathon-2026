"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search } from "lucide-react";

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
import { useDeleteDriver, useDrivers } from "@/features/drivers/hooks";
import { DriverFormDialog } from "@/features/drivers/components/driver-form-dialog";
import type { DriverRead } from "@/features/drivers/types";

const PAGE_SIZE = 10;

export function DriversTable() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("drivers:write");

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebounce(searchInput);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingDriver, setEditingDriver] = React.useState<DriverRead | null>(null);
  const [deletingDriver, setDeletingDriver] = React.useState<DriverRead | null>(null);

  const { data, isLoading, isError, error } = useDrivers({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
    sort_by: "created_at",
    sort_order: "desc",
  });

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const openCreate = () => {
    setEditingDriver(null);
    setFormOpen(true);
  };

  const openEdit = (driver: DriverRead) => {
    setEditingDriver(driver);
    setFormOpen(true);
  };

  const deleteDriver = useDeleteDriver();

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load drivers</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            className="pl-9"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus />
            Add driver
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Safety</TableHead>
              <TableHead>Region</TableHead>
              {canWrite && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  {canWrite && <TableCell />}
                </TableRow>
              ))
            ) : data && data.items.length > 0 ? (
              data.items.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(driver.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">{driver.contact_number}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{driver.license_number}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {driver.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{Math.round(driver.safety_score)}%</Badge>
                  </TableCell>
                  <TableCell>{driver.region ?? "—"}</TableCell>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canWrite ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No drivers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.pages} · {data.total} drivers
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

      <DriverFormDialog open={formOpen} onOpenChange={setFormOpen} driver={editingDriver} />
      {deletingDriver && (
        <Dialog open onOpenChange={() => setDeletingDriver(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete driver</DialogTitle>
              <DialogDescription>Are you sure you want to delete {deletingDriver.name}?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingDriver(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => { deleteDriver.mutate(deletingDriver.id); setDeletingDriver(null); }}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
