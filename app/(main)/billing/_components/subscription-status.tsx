import { type BadgeProps } from "@lemonsqueezy/wedges";
import { type SubscriptionStatusType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


export function SubscriptionStatus({
  status,
  statusFormatted,
  isPaused,
}: {
  status: SubscriptionStatusType;
  statusFormatted: string;
  isPaused?: boolean;
}) {
  const statusColor: Record<SubscriptionStatusType, BadgeProps["color"]> = {
    active: "green",
    cancelled: "gray",
    expired: "red",
    past_due: "red",
    on_trial: "primary",
    unpaid: "red",
    pause: "orange",
    paused: "orange",
  };

  const _status = isPaused ? "paused" : status;
  const _statusFormatted = isPaused ? "Paused" : statusFormatted;

  return (
    <>
      {status !== "cancelled" && (
        <span className="text-surface-200">&bull;</span>
      )}

      <Badge
        className={cn(`rounded-full px-1 py-0 text-sm`)}
        style={{
          background: statusColor[_status]
        }}
      >
        {_statusFormatted}
      </Badge>
    </>
  );
}