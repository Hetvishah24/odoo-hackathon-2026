"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure fleet preferences and app defaults." />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Theme and notification defaults can be configured here in the future.</p>
          <p>Current app shell already supports persisted light/dark mode.</p>
        </CardContent>
      </Card>
    </div>
  );
}
