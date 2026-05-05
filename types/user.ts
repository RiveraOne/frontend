export type UserPlan = "free" | "essential" | "pro";

export type UserDoc = {
  uid: string;
  email: string | null;
  displayName: string | null;
  plan: UserPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  advisorQueriesUsed: number;
  advisorQueriesResetAt: string; // ISO date string — first of month
  createdAt: string;
  updatedAt: string;
};
