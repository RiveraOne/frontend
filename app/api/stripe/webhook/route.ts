import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { planFromPriceId } from "@/lib/stripe/config";
import { upsertUserDoc } from "@/lib/firebase/userDoc";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;

  try {
    const rawBody = Buffer.from(await request.arrayBuffer());
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const uid = session.client_reference_id;
        if (!uid) break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null);

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : (session.customer?.id ?? null);

        // Retrieve subscription to get the price ID
        let plan: ReturnType<typeof planFromPriceId> = "free";
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = sub.items.data[0]?.price.id ?? "";
          plan = planFromPriceId(priceId);
        }

        await upsertUserDoc(uid, {
          plan,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: "active",
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const priceId = sub.items.data[0]?.price.id ?? "";
        const plan = planFromPriceId(priceId);

        // Find user doc by stripeCustomerId
        const uid = await findUidByCustomerId(customerId);
        if (!uid) break;

        await upsertUserDoc(uid, {
          plan,
          stripeSubscriptionId: sub.id,
          subscriptionStatus: sub.status,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const uid = await findUidByCustomerId(customerId);
        if (!uid) break;

        await upsertUserDoc(uid, {
          plan: "free",
          stripeSubscriptionId: null,
          subscriptionStatus: "canceled",
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : (invoice.customer?.id ?? null);
        if (!customerId) break;

        const uid = await findUidByCustomerId(customerId);
        if (!uid) break;

        await upsertUserDoc(uid, { subscriptionStatus: "past_due" });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : (invoice.customer?.id ?? null);
        if (!customerId) break;

        const uid = await findUidByCustomerId(customerId);
        if (!uid) break;

        await upsertUserDoc(uid, { subscriptionStatus: "active" });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function findUidByCustomerId(customerId: string): Promise<string | null> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const snap = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  return snap.empty ? null : snap.docs[0].id;
}
