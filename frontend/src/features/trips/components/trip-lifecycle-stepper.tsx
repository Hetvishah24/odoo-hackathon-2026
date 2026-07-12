import { Fragment } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TripRead } from "@/features/trips/types";

const STEPS = ["draft", "dispatched", "completed"] as const;
const STEP_LABELS: Record<(typeof STEPS)[number], string> = {
  draft: "Draft",
  dispatched: "Dispatched",
  completed: "Completed",
};

/** Draft -> Dispatched -> Completed, with Cancelled as a red terminal branch.
 * A cancelled trip may have been cancelled from draft or from dispatched —
 * start_odometer is only ever snapshotted at dispatch time, so its presence
 * tells us how far the trip actually got before it was cancelled. */
export function TripLifecycleStepper({ trip }: { trip: TripRead }) {
  const isCancelled = trip.status === "cancelled";
  const reachedDispatch = trip.start_odometer != null;
  const currentIndex = isCancelled ? -1 : STEPS.indexOf(trip.status as (typeof STEPS)[number]);

  const stepDone = (index: number) =>
    isCancelled ? index === 0 || (index === 1 && reachedDispatch) : index < currentIndex;
  const stepCurrent = (index: number) => !isCancelled && index === currentIndex;

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const done = stepDone(index);
        const current = stepCurrent(index);
        const lineFilled = index === 0 ? done || currentIndex > 0 : done;

        return (
          <Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  done && "border-green-600 bg-green-600 text-white",
                  current && "border-blue-600 bg-blue-600 text-white",
                  !done && !current && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  done || current ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            <div
              className={cn(
                "mx-2 h-0.5 flex-1",
                lineFilled ? "bg-green-600" : "bg-muted-foreground/30"
              )}
            />
          </Fragment>
        );
      })}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
            isCancelled
              ? "border-red-600 bg-red-600 text-white"
              : "border-muted-foreground/30 text-muted-foreground"
          )}
        >
          <X className="h-4 w-4" />
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            isCancelled ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Cancelled
        </span>
      </div>
    </div>
  );
}
