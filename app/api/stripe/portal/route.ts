import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { ensureUserDoc, upsertUserDoc } from "@/lib/firebase/userDoc";
import { stripe } from "@/lib/stripe/client";
import { isMissingStripeResource, messageForStripeError } from "@/lib/stripe/errors";

export const runtime = "nodejs";

function isDeletedStripeCustomer(customer: Awaited<ReturnType<typeof stripe.customers.retrieve>>): boolean {
  return "deleted" in customer && customer.deleted === true;
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

  const userDoc = await ensureUserDoc(uid, email, name);
  if (!userDoc?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  try {
    const customer = await stripe.customers.retrieve(userDoc.stripeCustomerId);
    if (isDeletedStripeCustomer(customer)) {
      await upsertUserDoc(uid, { stripeCustomerId: null });
      return NextResponse.json(
        { error: "No billing account found. Please start checkout again." },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userDoc.stripeCustomerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (isMissingStripeResource(error)) {
      await upsertUserDoc(uid, { stripeCustomerId: null });
      return NextResponse.json(
        { error: "No billing account found. Please start checkout again." },
        { status: 404 }
      );
    }

    console.error("Failed to create Stripe portal session", error);
    return NextResponse.json(
      { error: messageForStripeError(error, "Could not create Stripe billing portal session. Please try again.") },
      { status: 500 }
    );
  }
}
