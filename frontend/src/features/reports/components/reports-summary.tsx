"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { useExportReportCsv } from "@/features/reports/hooks";
import { reportTabs } from "@/features/reports/utils";
import type { ReportFilters, ReportType } from "@/features/reports/types";
import { ReportFilters as ReportFiltersBar, type ReportFilterState, ALL_VEHICLES } from "@/features/reports/components/report-filters";
import { FuelEfficiencyReport } from "@/features/reports/components/fuel-efficiency-report";
import { FleetUtilizationReport } from "@/features/reports/components/fleet-utilization-report";
import { OperationalCostReport } from "@/features/reports/components/operational-cost-report";
import { VehicleRoiReport } from "@/features/reports/components/vehicle-roi-report";

function toApiFilters(state: ReportFilterState): ReportFilters {
  return {
    vehicle_id: state.vehicleId === ALL_VEHICLES ? undefined : state.vehicleId,
    region: state.region || undefined,
    date_from: state.dateFrom || undefined,
    date_to: state.dateTo || undefined,
  };
}

const REPORT_TITLES: Record<ReportType, string> = {
  "fuel-efficiency": "Fuel Efficiency Report",
  utilization: "Fleet Utilization Report",
  cost: "Operational Cost Report",
  roi: "Vehicle ROI Report",
};

export function ReportsSummary() {
  const [activeTab, setActiveTab] = React.useState<ReportType>("fuel-efficiency");
  const [filterState, setFilterState] = React.useState<ReportFilterState>({
    vehicleId: ALL_VEHICLES,
    region: "",
    dateFrom: "",
    dateTo: "",
  });

  const exportCsv = useExportReportCsv();
  const apiFilters = toApiFilters(filterState);
  const exportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-lg border bg-card p-1">
          {reportTabs.map((tab) => (
            <Button
              key={tab.value}
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-md",
                activeTab === tab.value && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ExportPdfButton
            targetRef={exportRef}
            filename={`${activeTab}-report.pdf`}
            title={REPORT_TITLES[activeTab]}
            label="Export PDF"
          />
          <Button
            variant="outline"
            disabled={exportCsv.isPending}
            onClick={() => exportCsv.mutate({ type: activeTab, params: apiFilters })}
          >
            {exportCsv.isPending ? <Loader2 className="animate-spin" /> : <Download />}
            Download CSV
          </Button>
        </div>
      </div>

      <div ref={exportRef} className="space-y-6">
        <ReportFiltersBar reportType={activeTab} filters={filterState} onChange={setFilterState} />

        {activeTab === "fuel-efficiency" && <FuelEfficiencyReport filters={apiFilters} />}
        {activeTab === "utilization" && <FleetUtilizationReport filters={apiFilters} />}
        {activeTab === "cost" && <OperationalCostReport filters={apiFilters} />}
        {activeTab === "roi" && <VehicleRoiReport filters={apiFilters} />}
      </div>
    </div>
  );
}
