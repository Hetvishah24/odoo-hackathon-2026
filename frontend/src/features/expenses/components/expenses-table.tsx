"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Receipt, Search } from "lucide-react";

import { getErrorMessage } from "@/lib/api-client";
import { useDebounce } from "@/lib/use-debounce";
import { formatCurrency, formatShortDate } from "@/lib/format";
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
import { useTrips } from "@/features/trips/hooks";
import { formatTripLabel } from "@/features/trips/utils";
import { useExpenses } from "@/features/expenses/hooks";
import { ExpenseFormDialog } from "@/features/expenses/components/expense-form-dialog";
import { DeleteExpenseDialog } from "@/features/expenses/components/delete-expense-dialog";
import { expenseTypeLabels, expenseTypeStyles, expenseTypes } from "@/features/expenses/utils";
import type { ExpenseRead, ExpenseType } from "@/features/expenses/types";

const PAGE_SIZE = 10;
const ALL = "all";

export function ExpensesTable() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("expenses:write");

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebounce(searchInput);
  const [vehicleFilter, setVehicleFilter] = React.useState<string>(ALL);
  const [tripFilter, setTripFilter] = React.useState<string>(ALL);
  const [typeFilter, setTypeFilter] = React.useState<ExpenseType | typeof ALL>(ALL);
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseRead | null>(null);
  const [deletingExpense, setDeletingExpense] = React.useState<ExpenseRead | null>(null);

  const { data: vehicles } = useVehicles({
    page_size: 100,
    sort_by: "registration_number",
    sort_order: "asc",
  });
  const vehicleMap = React.useMemo(
    () => new Map(vehicles?.items.map((vehicle) => [vehicle.id, vehicle.registration_number])),
    [vehicles]
  );

  const { data: trips } = useTrips({
    vehicle_id: vehicleFilter === ALL ? undefined : Number(vehicleFilter),
    page_size: 100,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const tripMap = React.useMemo(
    () => new Map(trips?.items.map((trip) => [trip.id, formatTripLabel(trip)])),
    [trips]
  );

  const { data, isError, error, isLoading } = useExpenses({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
    vehicle_id: vehicleFilter === ALL ? undefined : Number(vehicleFilter),
    trip_id: tripFilter === ALL ? undefined : Number(tripFilter),
    type: typeFilter === ALL ? undefined : typeFilter,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort_by: "date",
    sort_order: "desc",
  });

  React.useEffect(() => {
    setPage(1);
  }, [search, vehicleFilter, tripFilter, typeFilter, dateFrom, dateTo]);

  React.useEffect(() => {
    setTripFilter(ALL);
  }, [vehicleFilter]);

  const openCreate = () => {
    setEditingExpense(null);
    setFormOpen(true);
  };

  const openEdit = (expense: ExpenseRead) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const hasFilters =
    Boolean(search) || vehicleFilter !== ALL || tripFilter !== ALL || typeFilter !== ALL || dateFrom || dateTo;

  const pageTotal = React.useMemo(
    () => data?.items.reduce((sum, expense) => sum + expense.amount, 0) ?? 0,
    [data]
  );

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load expenses</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-9"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ExpenseType | typeof ALL)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {expenseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {expenseTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All vehicles</SelectItem>
              {vehicles?.items.map((vehicle) => (
                <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                  {vehicle.registration_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={tripFilter}
            onValueChange={setTripFilter}
            disabled={vehicleFilter === ALL}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder={vehicleFilter === ALL ? "Trip (pick vehicle)" : "Trip"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All trips</SelectItem>
              {trips?.items.map((trip) => (
                <SelectItem key={trip.id} value={String(trip.id)}>
                  {formatTripLabel(trip)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-[150px]"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="From date"
          />
          <Input
            type="date"
            className="w-[150px]"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="To date"
          />
        </div>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus />
            Add Expense
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              {canWrite && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  {canWrite && <TableCell />}
                </TableRow>
              ))
            ) : data && data.items.length > 0 ? (
              data.items.map((expense: ExpenseRead) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground">{formatShortDate(expense.date)}</TableCell>
                  <TableCell className="font-medium">
                    {expense.vehicle_id ? vehicleMap.get(expense.vehicle_id) ?? `V${expense.vehicle_id}` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {expense.trip_id ? tripMap.get(expense.trip_id) ?? `#${expense.trip_id}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={expenseTypeStyles[expense.type]}>
                      {expenseTypeLabels[expense.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {expense.description || "—"}
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
                          <DropdownMenuItem onClick={() => openEdit(expense)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingExpense(expense)}
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
                <TableCell colSpan={canWrite ? 7 : 6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Receipt className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {hasFilters ? "No expenses match your filters." : "No expenses yet."}
                      </p>
                      {!hasFilters && (
                        <p className="text-sm text-muted-foreground">
                          Add a toll, maintenance, or other expense to start tracking spend.
                        </p>
                      )}
                    </div>
                    {canWrite && !hasFilters && (
                      <Button onClick={openCreate} className="mt-1">
                        <Plus />
                        Add your first expense
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.items.length > 0 && (
        <p className="text-sm text-muted-foreground">This page: {formatCurrency(pageTotal)}</p>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.pages} · {data.total} expenses
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

      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} expense={editingExpense} />
      <DeleteExpenseDialog expense={deletingExpense} onClose={() => setDeletingExpense(null)} />
    </div>
  );
}
