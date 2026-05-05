import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { ensureUserDoc, upsertUserDoc } from "@/lib/firebase/userDoc";
import { stripe } from "@/lib/stripe/client";
import { PLAN_CONFIG } from "@/lib/stripe/config";
import {
  getStripeAccountReadinessMessage,
  isMissingStripeResource,
  messageForStripeError,
} from "@/lib/stripe/errors";
import type { UserPlan } from "@/types/user";

export const runtime = "nodejs";

function isStripePriceId(priceId: string): boolean {
  return priceId.startsWith("price_");
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  let email: string | null;
  let name: string | null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email ?? null;
    name = decoded.name ?? null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let plan: UserPlan;
  try {
    const body = await request.json() as { plan?: string };
    const requestedPlan = body.plan as UserPlan | undefined;
    if (!requestedPlan || !PLAN_CONFIG[requestedPlan] || requestedPlan === "free") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    plan = requestedPlan;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const priceId = PLAN_CONFIG[plan].priceId;
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price not configured for this plan" }, { status: 500 });
  }

  if (!isStripePriceId(priceId)) {
    return NextResponse.json(
      { error: "Stripe price ID is invalid for this plan. Use a Stripe Price ID, not a Product ID." },
      { status: 500 }
    );
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  try {
    const readinessMessage = await getStripeAccountReadinessMessage();
    if (readinessMessage) {
      return NextResponse.json({ error: readinessMessage }, { status: 500 });
    }

    // Get or create Stripe customer
    const userDoc = await ensureUserDoc(uid, email, name);
    let stripeCustomerId = userDoc?.stripeCustomerId ?? null;

    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (error) {
        if (!isMissingStripeResource(error)) throw error;
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email ?? undefined,
        metadata: { firebaseUid: uid },
      });
      stripeCustomerId = customer.id;
      await upsertUserDoc(uid, { stripeCustomerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: uid,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/settings?upgraded=1`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create Stripe checkout session", error);
    return NextResponse.json(
      { error: messageForStripeError(error) },
      { status: 500 }
    );
  }
}
