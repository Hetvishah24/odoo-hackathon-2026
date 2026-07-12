import Link from "next/link";

import { StatCard } from "@/features/dashboard/components/stat-card";
import type { DriverOverview } from "@/features/dashboard/types";

export function DriverOverviewCards({ data }: { data: DriverOverview }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="On duty" value={data.drivers_on_duty} />
      <StatCard label="Available" value={data.drivers_available} />
      <StatCard label="Suspended" value={data.drivers_suspended} />
      <Link href="/drivers" className="block">
        <StatCard
          label="Licenses expiring soon"
          value={data.licenses_expiring_soon}
          hint="View drivers →"
        />
      </Link>
    </div>
  );
}
