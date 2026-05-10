import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeRequest, readJson } from "@/app/api/__test-helpers__";

const constructEvent = vi.fn();
const subscriptionsRetrieve = vi.fn();
const upsertUserDoc = vi.fn();
const findUidByCustomerIdMock = vi.fn();

vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    webhooks: { constructEvent: (...a: unknown[]) => constructEvent(...a) },
    subscriptions: { retrieve: subscriptionsRetrieve },
  },
}));

vi.mock("@/lib/stripe/config", () => ({
  PLAN_CONFIG: {
    free: { monthlyLimit: 5, priceId: null, label: "Free" },
    essential: { monthlyLimit: 50, priceId: "price_essential_test", label: "Essential" },
    pro: { monthlyLimit: Infinity, priceId: "price_pro_test", label: "Pro" },
  },
  planFromPriceId: (id: string) =>
    id === "price_essential_test" ? "essential" : id === "price_pro_test" ? "pro" : null,
}));

vi.mock("@/lib/firebase/userDoc", () => ({ upsertUserDoc }));

// `findUidByCustomerId` lives inside route.ts and dynamic-imports adminDb.
// Mock the dynamic import target so we don't need a real Firestore.
vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: () => ({
      where: () => ({
        limit: () => ({
          get: async () => {
            const uid = findUidByCustomerIdMock();
            if (!uid) return { empty: true, docs: [] };
            return { empty: false, docs: [{ id: uid }] };
          },
        }),
      }),
    }),
  },
  adminAuth: {},
}));

const URL_ = "http://localhost:3000/api/stripe/webhook";
const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...originalEnv };
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  findUidByCustomerIdMock.mockReturnValue("user-1");
});

afterEach(() => {
  process.env = { ...originalEnv };
});

function buildRequest(body = "raw-body", headers: Record<string, string> = {}) {
  return makeRequest(URL_, { method: "POST", headers, body });
}

describe("POST /api/stripe/webhook — guardrails", () => {
  it("returns 400 when the stripe-signature header is missing", async () => {
    const { POST } = await import("./route");
    const res = await POST(buildRequest("raw-body", {}));
    expect(res.status).toBe(400);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "Missing Stripe signature",
    });
  });

  it("returns 400 when STRIPE_WEBHOOK_SECRET is unset", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const { POST } = await import("./route");
    const res = await POST(buildRequest("raw-body", { "stripe-signature": "sig" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when constructEvent throws (invalid signature)", async () => {
    constructEvent.mockImplementationOnce(() => {
      throw new Error("invalid signature");
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest("raw-body", { "stripe-signature": "bad-sig" }));
    expect(res.status).toBe(400);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "Webhook signature verification failed",
    });
  });

  it("uses the raw request body buffer for constructEvent", async () => {
    constructEvent.mockReturnValueOnce({ type: "unhandled.event" });

    const { POST } = await import("./route");
    await POST(buildRequest("payload-bytes", { "stripe-signature": "sig" }));

    expect(constructEvent).toHaveBeenCalledTimes(1);
    const buf = constructEvent.mock.calls[0][0] as Buffer;
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.toString()).toBe("payload-bytes");
    expect(constructEvent.mock.calls[0][1]).toBe("sig");
    expect(constructEvent.mock.calls[0][2]).toBe("whsec_test");
  });
});

describe("POST /api/stripe/webhook — checkout.session.completed", () => {
  it("upserts plan + status when subscription has a known price", async () => {
    constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: "user-1",
          subscription: "sub_1",
          customer: "cus_1",
        },
      },
    });
    subscriptionsRetrieve.mockResolvedValueOnce({
      status: "active",
      items: { data: [{ price: { id: "price_pro_test" } }] },
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(res.status).toBe(200);
    expect(upsertUserDoc).toHaveBeenCalledWith("user-1", {
      plan: "pro",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      subscriptionStatus: "active",
    });
  });

  it("falls back to 'free' when the subscription's price is unknown", async () => {
    constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: "user-1",
          subscription: "sub_1",
          customer: "cus_1",
        },
      },
    });
    subscriptionsRetrieve.mockResolvedValueOnce({
      status: "active",
      items: { data: [{ price: { id: "price_unknown" } }] },
    });

    const { POST } = await import("./route");
    await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(upsertUserDoc).toHaveBeenCalledWith("user-1", {
      plan: "free",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      subscriptionStatus: "active",
    });
  });

  it("upserts with null subscription fields when there's no subscription", async () => {
    constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: "user-1",
          subscription: null,
          customer: "cus_1",
        },
      },
    });

    const { POST } = await import("./route");
    await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(upsertUserDoc).toHaveBeenCalledWith("user-1", {
      plan: "free",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: null,
      subscriptionStatus: null,
    });
    expect(subscriptionsRetrieve).not.toHaveBeenCalled();
  });

  it("no-ops when client_reference_id is missing", async () => {
    constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: { object: { client_reference_id: null } },
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(res.status).toBe(200);
    expect(upsertUserDoc).not.toHaveBeenCalled();
  });
});

describe("POST /api/stripe/webhook — subscription updates", () => {
  it("customer.subscription.updated: upserts known plan", async () => {
    constructEvent.mockReturnValueOnce({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "active",
          items: { data: [{ price: { id: "price_essential_test" } }] },
        },
      },
    });

    const { POST } = await import("./route");
    await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(upsertUserDoc).toHaveBeenCalledWith("user-1", {
      plan: "essential",
      stripeSubscriptionId: "sub_1",
      subscriptionStatus: "active",
    });
  });

  it("customer.subscription.updated: falls back to 'free' for unknown price", async () => {
    constructEvent.mockReturnValueOnce({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "active",
          items: { data: [{ price: { id: "price_unknown" } }] },
        },
      },
    });

    const { POST } = await import("./route");
    await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(upsertUserDoc).toHaveBeenCalledWith("user-1", expect.objectContaining({ plan: "free" }));
  });

  it("customer.subscription.updated: no-ops when no user doc matches the customer", async () => {
    findUidByCustomerIdMock.mockReturnValueOnce(null);
    constructEvent.mockReturnValueOnce({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_unknown",
          status: "active",
          items: { data: [{ price: { id: "price_essential_test" } }] },
        },
      },
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(res.status).toBe(200);
    expect(upsertUserDoc).not.toHaveBeenCalled();
  });

  it("customer.subscription.deleted: sets plan='free' + status='canceled'", async () => {
    constructEvent.mockReturnValueOnce({
      type: "customer.subscription.deleted",
      data: {
        object: { id: "sub_1", customer: "cus_1", items: { data: [] } },
      },
    });

    const { POST } = await import("./route");
    await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(upsertUserDoc).toHaveBeenCalledWith("user-1", {
      plan: "free",
      stripeSubscriptionId: null,
      subscriptionStatus: "canceled",
    });
  });
});

describe("POST /api/stripe/webhook — invoice events", () => {
  it("invoice.payment_failed: sets subscriptionStatus='past_due'", async () => {
    constructEvent.mockReturnValueOnce({
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_1" } },
    });

    const { POST } = await import("./route");
    await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(upsertUserDoc).toHaveBeenCalledWith("user-1", { subscriptionStatus: "past_due" });
  });

  it("invoice.payment_succeeded: sets subscriptionStatus='active'", async () => {
    constructEvent.mockReturnValueOnce({
      type: "invoice.payment_succeeded",
      data: { object: { customer: "cus_1" } },
    });

    const { POST } = await import("./route");
    await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(upsertUserDoc).toHaveBeenCalledWith("user-1", { subscriptionStatus: "active" });
  });

  it("invoice events no-op when customer cannot be resolved", async () => {
    findUidByCustomerIdMock.mockReturnValueOnce(null);
    constructEvent.mockReturnValueOnce({
      type: "invoice.payment_succeeded",
      data: { object: { customer: "cus_unknown" } },
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(res.status).toBe(200);
    expect(upsertUserDoc).not.toHaveBeenCalled();
  });

  it("invoice events no-op when invoice has no customer", async () => {
    constructEvent.mockReturnValueOnce({
      type: "invoice.payment_failed",
      data: { object: { customer: null } },
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(res.status).toBe(200);
    expect(upsertUserDoc).not.toHaveBeenCalled();
  });
});

describe("POST /api/stripe/webhook — handler error", () => {
  it("returns 500 when an event handler throws", async () => {
    constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: "user-1",
          subscription: "sub_1",
          customer: "cus_1",
        },
      },
    });
    subscriptionsRetrieve.mockRejectedValueOnce(new Error("stripe down"));

    const { POST } = await import("./route");
    const res = await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/stripe/webhook — unhandled event types", () => {
  it("returns 200 (received: true) and does not write", async () => {
    constructEvent.mockReturnValueOnce({
      type: "customer.created",
      data: { object: {} },
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest("body", { "stripe-signature": "sig" }));
    expect(res.status).toBe(200);
    expect(await readJson<{ received: boolean }>(res)).toEqual({ received: true });
    expect(upsertUserDoc).not.toHaveBeenCalled();
  });
});
