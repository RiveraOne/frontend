import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { UserDoc, UserPlan } from "@/types/user";

function firstOfCurrentMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function isNewMonth(resetAt: string): boolean {
  const reset = new Date(resetAt);
  const now = new Date();
  return (
    now.getFullYear() > reset.getFullYear() ||
    now.getMonth() > reset.getMonth()
  );
}

const usersCol = () => adminDb.collection("users");

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
  const ref = usersCol().doc(uid);
  const snap = await ref.get();

  if (snap.exists) return; // idempotent — never overwrite existing plan

  const now = new Date().toISOString();
  const doc: UserDoc = {
    uid,
    email,
    displayName,
    plan: "free",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    advisorQueriesUsed: 0,
    advisorQueriesResetAt: firstOfCurrentMonth(),
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(doc);
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
