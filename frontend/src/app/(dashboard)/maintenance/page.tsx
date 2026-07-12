"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sampleMaintenance = [
  { id: 1, vehicle: "Bike-03", status: "open", issue: "Brake inspection" },
  { id: 2, vehicle: "Van-05", status: "closed", issue: "Oil change" },
];

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" description="Track service work and maintenance outcomes." />

      <div className="grid gap-4">
        {sampleMaintenance.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{item.vehicle}</CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.issue}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
