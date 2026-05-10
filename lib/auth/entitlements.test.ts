import { describe, it, expect } from "vitest";
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  hasActiveSubscription,
  hasPaidAdvisorAccess,
  isPaidPlan,
} from "./entitlements";
import type { UserDoc } from "@/types/user";

type EntitlementUser = Pick<UserDoc, "plan" | "subscriptionStatus">;

describe("ACTIVE_SUBSCRIPTION_STATUSES", () => {
  it("contains exactly active and trialing", () => {
    expect([...ACTIVE_SUBSCRIPTION_STATUSES].sort()).toEqual(["active", "trialing"]);
  });
});

describe("isPaidPlan", () => {
  it("returns true for essential", () => {
    expect(isPaidPlan("essential")).toBe(true);
  });

  it("returns true for pro", () => {
    expect(isPaidPlan("pro")).toBe(true);
  });

  it("returns false for free", () => {
    expect(isPaidPlan("free")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isPaidPlan(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isPaidPlan(undefined)).toBe(false);
  });
});

describe("hasActiveSubscription", () => {
  it.each(["active", "trialing"])("returns true for %s", (status) => {
    expect(hasActiveSubscription(status)).toBe(true);
  });

  it.each([
    "canceled",
    "past_due",
    "incomplete",
    "incomplete_expired",
    "unpaid",
    "paused",
    "",
    "ACTIVE",
    "Active",
  ])("returns false for %s", (status) => {
    expect(hasActiveSubscription(status)).toBe(false);
  });

  it("returns false for null", () => {
    expect(hasActiveSubscription(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasActiveSubscription(undefined)).toBe(false);
  });

  it("returns false for non-string values", () => {
    expect(hasActiveSubscription(1 as unknown as string)).toBe(false);
    expect(hasActiveSubscription({} as unknown as string)).toBe(false);
  });
});

describe("hasPaidAdvisorAccess", () => {
  const mk = (plan: EntitlementUser["plan"], status: string | null): EntitlementUser => ({
    plan,
    subscriptionStatus: status,
  });

  it("grants access when paid plan + active subscription", () => {
    expect(hasPaidAdvisorAccess(mk("essential", "active"))).toBe(true);
    expect(hasPaidAdvisorAccess(mk("pro", "trialing"))).toBe(true);
  });

  it("denies access when paid plan but inactive subscription", () => {
    expect(hasPaidAdvisorAccess(mk("essential", "canceled"))).toBe(false);
    expect(hasPaidAdvisorAccess(mk("pro", "past_due"))).toBe(false);
    expect(hasPaidAdvisorAccess(mk("pro", null))).toBe(false);
  });

  it("denies access when free plan, regardless of status", () => {
    expect(hasPaidAdvisorAccess(mk("free", "active"))).toBe(false);
    expect(hasPaidAdvisorAccess(mk("free", "trialing"))).toBe(false);
  });

  it("denies access when userDoc is null or undefined", () => {
    expect(hasPaidAdvisorAccess(null)).toBe(false);
    expect(hasPaidAdvisorAccess(undefined)).toBe(false);
  });
});
