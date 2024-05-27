import { getSubscriptionURLs } from "@/data";

import { Subscription } from "@prisma/client";
import { SubscriptionActionsDropdown } from "./subscription-actions-dropdown";


export async function SubscriptionActions({
  subscription,
}: {
  subscription: Subscription;
}) {
  if (
    subscription &&
    (subscription.status === "expired" ||
    subscription.status === "cancelled" ||
    subscription.status === "unpaid")
  ) {
    return null;
  }

  const urls = await getSubscriptionURLs(subscription.lemonSqueezyId);

  return (
    <SubscriptionActionsDropdown subscription={subscription} urls={urls} />
  );
}