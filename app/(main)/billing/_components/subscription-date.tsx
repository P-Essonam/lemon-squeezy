import { formatDate } from "@/lib/utils";
import { type SubscriptionStatusType } from "@/lib/types";

export function SubscriptionDate({
  endsAt,
  renewsAt,
  trialEndsAt,
}: {
  endsAt?: string | null;
  renewsAt?: string | null;
  status: SubscriptionStatusType;
  trialEndsAt?: string | null;
}) {
  const now = new Date();
  const trialEndDate = trialEndsAt ? new Date(trialEndsAt) : null;
  const endsAtDate = endsAt ? new Date(endsAt) : null;
  let message = `Renews on ${formatDate(renewsAt)}`;

  if (!trialEndsAt && !renewsAt) return null;

  if (trialEndDate && trialEndDate > now) {
    message = `Ends on ${formatDate(trialEndsAt)}`;
  }

  if (endsAt) {
    message =
      endsAtDate && endsAtDate < now
        ? `Expired on ${formatDate(endsAt)}`
        : `Expires on ${formatDate(endsAt)}`;
  }

  return (
    <div className="flex space-x-3">
      {<span className="text-surface-200">&bull;</span>}
      <p>{message}</p>
    </div>
  );
}