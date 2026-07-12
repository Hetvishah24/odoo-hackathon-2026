import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { SafetyOverview } from "@/features/dashboard/types";

export function SafetyOverviewPanel({ data }: { data: SafetyOverview }) {
  const sortedAlerts = [...data.license_alerts].sort(
    (a, b) => a.days_remaining - b.days_remaining
  );

  return (
    <div className="space-y-4">
      <StatCard label="Average safety score" value={data.average_safety_score.toFixed(1)} />
      <Card>
        <CardHeader>
          <CardTitle>License alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedAlerts.length > 0 ? (
            sortedAlerts.map((alert) => (
              <div
                key={alert.driver_id}
                className="flex items-center justify-between rounded-md border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950/30"
              >
                <div>
                  <p className="font-medium">{alert.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires {new Date(alert.license_expiry_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {alert.days_remaining}d
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No licenses expiring soon.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
