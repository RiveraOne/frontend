import type { UserDoc, UserPlan } from "@/types/user";

export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function isPaidPlan(plan: UserPlan | null | undefined): plan is Exclude<UserPlan, "free"> {
  return plan === "essential" || plan === "pro";
}

export function hasActiveSubscription(status: string | null | undefined): boolean {
  return typeof status === "string" && ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}

export function hasPaidAdvisorAccess(
  userDoc: Pick<UserDoc, "plan" | "subscriptionStatus"> | null | undefined
): boolean {
  return isPaidPlan(userDoc?.plan) && hasActiveSubscription(userDoc?.subscriptionStatus);
}
