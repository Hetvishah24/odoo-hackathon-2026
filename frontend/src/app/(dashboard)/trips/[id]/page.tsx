"use client";

import { useParams } from "next/navigation";

import { TripDetail } from "@/features/trips/components/trip-detail";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const tripId = Number(params.id);

  return <TripDetail tripId={tripId} />;
}
