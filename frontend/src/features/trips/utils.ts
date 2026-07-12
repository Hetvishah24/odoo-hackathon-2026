import type { TripRead } from "@/features/trips/types";

export function formatTripLabel(trip: TripRead): string {
  return `${trip.source} → ${trip.destination}`;
}
