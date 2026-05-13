import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { upsertUserDoc } from "@/lib/firebase/userDoc";
import { stripe } from "@/lib/stripe/client";
import { planFromPriceId } from "@/lib/stripe/config";
import { messageForStripeError } from "@/lib/stripe/errors";
import type { UserPlan } from "@/types/user";

export const runtime = "nodejs";

type SyncBody = {
  sessionId?: string;
};

function getSubscriptionId(subscription: unknown): string | null {
  if (typeof subscription === "string") return subscription;
  if (
    subscription &&
    typeof subscription === "object" &&
    "id" in subscription &&
    typeof subscription.id === "string"
  ) {
    return subscription.id;
  }
  return null;
}

function getCustomerId(customer: unknown): string | null {
  if (typeof customer === "string") return customer;
  if (
    customer &&
    typeof customer === "object" &&
    "id" in customer &&
    typeof customer.id === "string"
  ) {
    return customer.id;
  }
  return null;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SyncBody;
  try {
    body = (await request.json()) as SyncBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid checkout session" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== uid) {
      return NextResponse.json({ error: "Checkout session does not belong to this user" }, { status: 403 });
    }

    const subscriptionId = getSubscriptionId(session.subscription);
    const customerId = getCustomerId(session.customer);
    if (!subscriptionId || !customerId) {
      return NextResponse.json({ error: "Checkout session has no subscription" }, { status: 409 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id ?? "";
    const plan: UserPlan | null = planFromPriceId(priceId);

    if (!plan) {
      console.error("Stripe checkout sync found unknown price ID", { priceId, subscriptionId, uid });
      return NextResponse.json({ error: "Subscription plan is not configured" }, { status: 500 });
    }

    await upsertUserDoc(uid, {
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
    });

    return NextResponse.json({ plan, subscriptionStatus: subscription.status });
  } catch (error) {
    console.error("Failed to sync Stripe checkout session", error);
    return NextResponse.json(
      { error: messageForStripeError(error, "Could not verify subscription. Please try again.") },
      { status: 500 }
    );
  }
}
