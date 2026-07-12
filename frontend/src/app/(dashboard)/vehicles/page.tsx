"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sampleVehicles = [
  { id: 1, name: "Van-05", type: "van", status: "available", region: "North" },
  { id: 2, name: "Truck-12", type: "truck", status: "on_trip", region: "Central" },
  { id: 3, name: "Bike-03", type: "bike", status: "in_shop", region: "West" },
];

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicles"
        description="Track fleet inventory, readiness, and service states."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sampleVehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {vehicle.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Type</span>
                <span className="font-medium text-foreground capitalize">{vehicle.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Region</span>
                <span className="font-medium text-foreground">{vehicle.region}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
