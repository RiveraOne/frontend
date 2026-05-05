import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { UserDoc, UserPlan } from "@/types/user";

const USER_PLANS = new Set<UserPlan>(["free", "essential", "pro"]);

function firstOfCurrentMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function isNewMonth(resetAt: string): boolean {
  const reset = new Date(resetAt);
  if (Number.isNaN(reset.getTime())) return true;

  const now = new Date();
  return (
    now.getFullYear() > reset.getFullYear() ||
    now.getMonth() > reset.getMonth()
  );
}

const usersCol = () => adminDb.collection("users");

function isUserPlan(plan: unknown): plan is UserPlan {
  return typeof plan === "string" && USER_PLANS.has(plan as UserPlan);
}

function buildCompleteUserDoc(
  uid: string,
  fields: Partial<UserDoc>,
  email: string | null,
  displayName: string | null
): UserDoc {
  const now = new Date().toISOString();

  return {
    uid,
    email: fields.email ?? email,
    displayName: fields.displayName ?? displayName,
    plan: isUserPlan(fields.plan) ? fields.plan : "free",
    stripeCustomerId: fields.stripeCustomerId ?? null,
    stripeSubscriptionId: fields.stripeSubscriptionId ?? null,
    subscriptionStatus: fields.subscriptionStatus ?? null,
    advisorQueriesUsed:
      typeof fields.advisorQueriesUsed === "number" &&
      Number.isFinite(fields.advisorQueriesUsed)
        ? fields.advisorQueriesUsed
        : 0,
    advisorQueriesResetAt:
      typeof fields.advisorQueriesResetAt === "string"
        ? fields.advisorQueriesResetAt
        : firstOfCurrentMonth(),
    createdAt: fields.createdAt ?? now,
    updatedAt: now,
  };
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await usersCol().doc(uid).get();
  return snap.exists ? (snap.data() as UserDoc) : null;
}

export async function upsertUserDoc(
  uid: string,
  fields: Partial<UserDoc>
): Promise<void> {
  await usersCol()
    .doc(uid)
    .set({ ...fields, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function provisionUserDoc(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<void> {
  await ensureUserDoc(uid, email, displayName);
}

export async function ensureUserDoc(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<UserDoc> {
  const ref = usersCol().doc(uid);
  const snap = await ref.get();

  const existing = snap.exists ? (snap.data() as Partial<UserDoc>) : {};
  const doc = buildCompleteUserDoc(uid, existing, email, displayName);

  await ref.set(doc, { merge: true });
  return doc;
}

export async function resetAdvisorUsageIfNeeded(
  uid: string,
  userDoc: UserDoc
): Promise<UserDoc> {
  if (!isNewMonth(userDoc.advisorQueriesResetAt)) return userDoc;

  const resetAt = firstOfCurrentMonth();
  await usersCol().doc(uid).update({
    advisorQueriesUsed: 0,
    advisorQueriesResetAt: resetAt,
    updatedAt: new Date().toISOString(),
  });

  return { ...userDoc, advisorQueriesUsed: 0, advisorQueriesResetAt: resetAt };
}

export async function incrementAdvisorUsage(uid: string): Promise<void> {
  await usersCol().doc(uid).update({
    advisorQueriesUsed: FieldValue.increment(1),
    updatedAt: new Date().toISOString(),
  });
}

export async function setPlanFromStripe(
  uid: string,
  plan: UserPlan,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  subscriptionStatus: string
): Promise<void> {
  await upsertUserDoc(uid, {
    plan,
    stripeCustomerId,
    stripeSubscriptionId,
    subscriptionStatus,
  });
}
