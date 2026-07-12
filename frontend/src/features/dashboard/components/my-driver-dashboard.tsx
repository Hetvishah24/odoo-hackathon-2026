import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MyDashboard } from "@/features/dashboard/types";

export function MyDriverDashboard({ data }: { data: MyDashboard | null }) {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center text-center text-muted-foreground">
          No driver profile linked yet — contact your fleet manager.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My active trip</CardTitle>
        </CardHeader>
        <CardContent>
          {data.my_active_trip ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {data.my_active_trip.source} → {data.my_active_trip.destination}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {data.my_active_trip.status}
                </Badge>
                {data.my_active_trip.eta_minutes != null && (
                  <span className="text-sm text-muted-foreground">
                    ETA {data.my_active_trip.eta_minutes} min
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active trip.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.my_vehicle ? (
              <div className="flex items-center justify-between">
                <p className="font-semibold">{data.my_vehicle.registration_number}</p>
                <Badge variant="outline" className="capitalize">
                  {data.my_vehicle.status.replace("_", " ")}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vehicle assigned.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">My stats</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between text-sm">
            <div>
              <p className="text-2xl font-semibold">{data.my_completed_trips_count}</p>
              <p className="text-muted-foreground">Completed trips</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{data.my_safety_score}</p>
              <p className="text-muted-foreground">Safety score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming trips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.my_upcoming_trips.length > 0 ? (
            data.my_upcoming_trips.map((trip) => (
              <div
                key={trip.trip_number}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>
                  {trip.source} → {trip.destination}
                </span>
                <Badge variant="secondary" className="capitalize">
                  {trip.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming trips.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
