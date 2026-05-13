import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bearer, makeRequest, readJson } from "@/app/api/__test-helpers__";

const verifyIdToken = vi.fn();
const checkoutSessionsRetrieve = vi.fn();
const subscriptionsRetrieve = vi.fn();
const upsertUserDoc = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: { verifyIdToken },
}));

vi.mock("@/lib/firebase/userDoc", () => ({ upsertUserDoc }));

vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    checkout: { sessions: { retrieve: checkoutSessionsRetrieve } },
    subscriptions: { retrieve: subscriptionsRetrieve },
  },
}));

vi.mock("@/lib/stripe/config", () => ({
  planFromPriceId: (id: string) =>
    id === "price_essential_test" ? "essential" : id === "price_pro_test" ? "pro" : null,
}));

vi.mock("@/lib/stripe/errors", () => ({
  messageForStripeError: (_e: unknown, fallback?: string) => fallback ?? "stripe-error",
}));

const URL_ = "http://localhost:3000/api/stripe/sync";

beforeEach(() => {
  vi.clearAllMocks();
  verifyIdToken.mockResolvedValue({ uid: "u-1" });
  checkoutSessionsRetrieve.mockResolvedValue({
    id: "cs_test_1",
    client_reference_id: "u-1",
    customer: "cus_1",
    subscription: "sub_1",
  });
  subscriptionsRetrieve.mockResolvedValue({
    status: "active",
    items: { data: [{ price: { id: "price_essential_test" } }] },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

function postBody(body: unknown, opts: { token?: string; noAuth?: boolean } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!opts.noAuth) Object.assign(headers, bearer(opts.token ?? "good"));
  return makeRequest(URL_, { method: "POST", headers, body: JSON.stringify(body) });
}

describe("POST /api/stripe/sync — auth and validation", () => {
  it("returns 401 without an auth token", async () => {
    const { POST } = await import("./route");
    const res = await POST(postBody({ sessionId: "cs_test_1" }, { noAuth: true }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when token verification fails", async () => {
    verifyIdToken.mockRejectedValueOnce(new Error("bad token"));
    const { POST } = await import("./route");
    const res = await POST(postBody({ sessionId: "cs_test_1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid session id", async () => {
    const { POST } = await import("./route");
    const res = await POST(postBody({ sessionId: "not_a_session" }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/stripe/sync — checkout reconciliation", () => {
  it("persists the subscription plan for the authenticated user", async () => {
    const { POST } = await import("./route");
    const res = await POST(postBody({ sessionId: "cs_test_1" }));

    expect(res.status).toBe(200);
    expect(checkoutSessionsRetrieve).toHaveBeenCalledWith("cs_test_1");
    expect(subscriptionsRetrieve).toHaveBeenCalledWith("sub_1");
    expect(upsertUserDoc).toHaveBeenCalledWith("u-1", {
      plan: "essential",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      subscriptionStatus: "active",
    });
    expect(await readJson(res)).toEqual({ plan: "essential", subscriptionStatus: "active" });
  });

  it("rejects a checkout session owned by another user", async () => {
    checkoutSessionsRetrieve.mockResolvedValueOnce({
      id: "cs_test_1",
      client_reference_id: "other-user",
      customer: "cus_1",
      subscription: "sub_1",
    });

    const { POST } = await import("./route");
    const res = await POST(postBody({ sessionId: "cs_test_1" }));

    expect(res.status).toBe(403);
    expect(upsertUserDoc).not.toHaveBeenCalled();
  });

  it("returns 500 when the subscription price is not configured", async () => {
    subscriptionsRetrieve.mockResolvedValueOnce({
      status: "active",
      items: { data: [{ price: { id: "price_unknown" } }] },
    });

    const { POST } = await import("./route");
    const res = await POST(postBody({ sessionId: "cs_test_1" }));

    expect(res.status).toBe(500);
    expect(upsertUserDoc).not.toHaveBeenCalled();
  });
});
