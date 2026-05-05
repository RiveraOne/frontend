import type { UserPlan } from "@/types/user";

export type PlanConfig = {
  monthlyLimit: number; // Infinity for unlimited
  priceId: string | null;
  label: string;
};

export const PLAN_CONFIG: Record<UserPlan, PlanConfig> = {
  free: {
    monthlyLimit: 5,
    priceId: null,
    label: "Free",
  },
  essential: {
    monthlyLimit: 50,
    priceId: process.env.STRIPE_PRICE_ESSENTIAL ?? null,
    label: "Essential",
  },
  pro: {
    monthlyLimit: Infinity,
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    label: "Pro",
  },
};

export function planFromPriceId(priceId: string): UserPlan {
  for (const [plan, config] of Object.entries(PLAN_CONFIG)) {
    if (config.priceId === priceId) return plan as UserPlan;
  }
  return "free";
}
