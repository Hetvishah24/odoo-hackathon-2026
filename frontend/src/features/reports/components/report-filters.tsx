"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVehicles } from "@/features/vehicles/hooks";
import type { ReportType } from "@/features/reports/types";

const ALL = "all";

export interface ReportFilterState {
  vehicleId: number | typeof ALL;
  region: string;
  dateFrom: string;
  dateTo: string;
}

interface ReportFiltersProps {
  reportType: ReportType;
  filters: ReportFilterState;
  onChange: (filters: ReportFilterState) => void;
}

// Mirrors each endpoint's actual query params (see 09_REPORTS.md: "not all filters apply
// to all four reports") - vehicle-roi only takes vehicle_id, fleet-utilization takes
// region instead of vehicle_id, the rest take vehicle_id + date range.
const SHOWS_VEHICLE: ReportType[] = ["fuel-efficiency", "cost", "roi"];
const SHOWS_REGION: ReportType[] = ["utilization"];
const SHOWS_DATE_RANGE: ReportType[] = ["fuel-efficiency", "utilization", "cost"];

export function ReportFilters({ reportType, filters, onChange }: ReportFiltersProps) {
  const { data: vehicles } = useVehicles({ page: 1, page_size: 100, sort_by: "registration_number" });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {SHOWS_VEHICLE.includes(reportType) && (
        <Select
          value={String(filters.vehicleId)}
          onValueChange={(value) =>
            onChange({ ...filters, vehicleId: value === ALL ? ALL : Number(value) })
          }
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="All vehicles" />
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
      )}

      {SHOWS_REGION.includes(reportType) && (
        <Input
          placeholder="Region (e.g. Mumbai)"
          className="w-full sm:w-[200px]"
          value={filters.region}
          onChange={(event) => onChange({ ...filters, region: event.target.value })}
        />
      )}

      {SHOWS_DATE_RANGE.includes(reportType) && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-[160px]"
            value={filters.dateFrom}
            onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })}
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            className="w-[160px]"
            value={filters.dateTo}
            onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
          />
        </div>
      )}
    </div>
  );
}

export const ALL_VEHICLES = ALL;
