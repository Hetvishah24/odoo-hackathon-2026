import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TripStatus } from "@/features/trips/types";

const LABELS: Record<TripStatus, string> = {
  draft: "Draft",
  dispatched: "Dispatched",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function TripStatusBadge({ status }: { status: TripStatus }) {
  if (status === "dispatched") {
    return (
      <Badge className="gap-1.5 border-transparent bg-blue-600 text-white hover:bg-blue-600">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        {LABELS.dispatched}
      </Badge>
    );
  }

  if (status === "completed") {
    return (
      <Badge variant="outline" className="border-green-600 text-green-700 dark:text-green-400">
        {LABELS.completed}
      </Badge>
    );
  }

  if (status === "cancelled") {
    return (
      <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground line-through">
        {LABELS.cancelled}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("text-slate-600 dark:text-slate-400")}>
      {LABELS.draft}
    </Badge>
  );
}
