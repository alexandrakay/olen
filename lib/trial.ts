import type { Timestamp } from "firebase/firestore";
import type { User } from "@/lib/types";

const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

export function isWithinGracePeriod(trialEndsAt: Timestamp, now: Date): boolean {
  return now.getTime() <= trialEndsAt.toMillis() + GRACE_PERIOD_MS;
}

export function needsPaywall(user: User, now: Date): boolean {
  if (user.subscriptionStatus === "active") return false;
  if (user.subscriptionStatus === "past_due") return false;
  if (user.subscriptionStatus === "cancelled") return true;
  if (user.subscriptionStatus === "expired") return true;
  // trial: block only once past grace period
  if (user.subscriptionStatus === "trial") {
    return !isWithinGracePeriod(user.trialEndsAt, now);
  }
  return false;
}
