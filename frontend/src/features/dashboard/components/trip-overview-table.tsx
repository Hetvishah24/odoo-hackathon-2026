"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { TripOverview } from "@/features/dashboard/types";

interface TripOverviewTableProps {
  data: TripOverview;
  /** Hides the actions column entirely for roles without trips:write (e.g. safety_officer). */
  showActions: boolean;
}

export function TripOverviewTable({ data, showActions }: TripOverviewTableProps) {
  const columnCount = showActions ? 6 : 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Active trips" value={data.active_trips} />
          <StatCard label="Pending trips" value={data.pending_trips} />
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent_trips.length > 0 ? (
                data.recent_trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.trip_number}</TableCell>
                    <TableCell>{trip.vehicle}</TableCell>
                    <TableCell>{trip.driver}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{trip.eta_minutes != null ? `${trip.eta_minutes} min` : "—"}</TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/trips">Manage</Link>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnCount} className="h-20 text-center text-muted-foreground">
                    No recent trips.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
