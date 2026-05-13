import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bearer, makeRequest, readJson } from "@/app/api/__test-helpers__";

const verifyIdToken = vi.fn();
const ensureUserDoc = vi.fn();
const upsertUserDoc = vi.fn();
const getAppBaseUrl = vi.fn();
const getStripeAccountReadinessMessage = vi.fn();
const customersRetrieve = vi.fn();
const customersCreate = vi.fn();
const checkoutSessionsCreate = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: { verifyIdToken },
  adminDb: { collection: vi.fn() },
}));

vi.mock("@/lib/firebase/userDoc", () => ({
  ensureUserDoc,
  upsertUserDoc,
}));

vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    customers: { retrieve: customersRetrieve, create: customersCreate },
    checkout: { sessions: { create: checkoutSessionsCreate } },
  },
}));

vi.mock("@/lib/routes/appUrl", () => ({ getAppBaseUrl }));

vi.mock("@/lib/stripe/errors", () => ({
  getStripeAccountReadinessMessage,
  isMissingStripeResource: (e: unknown) =>
    typeof e === "object" && e !== null && (e as { code?: string }).code === "resource_missing",
  messageForStripeError: (_e: unknown, fallback?: string) =>
    fallback ?? "stripe-error",
}));

// Mock PLAN_CONFIG so each test has full control over plan/price config
// without needing module-cache resets.
const PLAN_CONFIG = {
  free: { monthlyLimit: 5, priceId: null, label: "Free" },
  essential: { monthlyLimit: 50, priceId: "price_essential_test", label: "Essential" },
  pro: { monthlyLimit: Infinity, priceId: "price_pro_test", label: "Pro" },
};
vi.mock("@/lib/stripe/config", () => ({
  PLAN_CONFIG,
  planFromPriceId: (id: string) =>
    id === "price_essential_test" ? "essential" : id === "price_pro_test" ? "pro" : null,
}));

const URL_ = "http://localhost:3000/api/stripe/checkout";

beforeEach(() => {
  vi.clearAllMocks();

  // Reset mocked PLAN_CONFIG to canonical defaults for each test.
  PLAN_CONFIG.essential.priceId = "price_essential_test";
  PLAN_CONFIG.pro.priceId = "price_pro_test";

  verifyIdToken.mockResolvedValue({ uid: "u-1", email: "ada@example.com", name: "Ada" });
  ensureUserDoc.mockResolvedValue({ stripeCustomerId: null });
  getAppBaseUrl.mockReturnValue("https://example.com");
  getStripeAccountReadinessMessage.mockResolvedValue(null);
  customersCreate.mockResolvedValue({ id: "cus_new" });
  checkoutSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_x" });
});

afterEach(() => {
  // Restore canonical defaults so leftover mutations don't leak.
  PLAN_CONFIG.essential.priceId = "price_essential_test";
  PLAN_CONFIG.pro.priceId = "price_pro_test";
});

function postBody(body: unknown, opts: { token?: string; noAuth?: boolean } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!opts.noAuth) Object.assign(headers, bearer(opts.token ?? "good"));
  return makeRequest(URL_, { method: "POST", headers, body: JSON.stringify(body) });
}

describe("POST /api/stripe/checkout — auth", () => {
  it("returns 401 when no Authorization header", async () => {
    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }, { noAuth: true }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when verifyIdToken throws", async () => {
    verifyIdToken.mockRejectedValueOnce(new Error("bad"));
    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));
    expect(res.status).toBe(401);
  });
});

describe("POST /api/stripe/checkout — plan validation", () => {
  it("returns 400 when plan is missing", async () => {
    const { POST } = await import("./route");
    const res = await POST(postBody({}));
    expect(res.status).toBe(400);
    expect(await readJson<{ error: string }>(res)).toEqual({ error: "Invalid plan" });
  });

  it("returns 400 when plan is 'free'", async () => {
    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "free" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when plan is unknown", async () => {
    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "platinum" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is not JSON", async () => {
    const req = makeRequest(URL_, {
      method: "POST",
      headers: { ...bearer("good"), "Content-Type": "application/json" },
      body: "not json",
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/stripe/checkout — price config validation", () => {
  it("returns 500 when the plan's priceId is null (not configured)", async () => {
    PLAN_CONFIG.essential.priceId = null as unknown as string;

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));
    expect(res.status).toBe(500);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "Stripe price not configured for this plan",
    });
  });

  it("returns 500 when priceId doesn't start with 'price_' (e.g. it's a product ID)", async () => {
    PLAN_CONFIG.essential.priceId = "prod_essential_test";

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));
    expect(res.status).toBe(500);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "Stripe price ID is invalid for this plan. Use a Stripe Price ID, not a Product ID.",
    });
  });
});

describe("POST /api/stripe/checkout — account readiness", () => {
  it("returns 500 with the readiness message when Stripe live account isn't ready", async () => {
    getStripeAccountReadinessMessage.mockResolvedValueOnce(
      "Stripe live checkout is not enabled for this account yet."
    );
    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));
    expect(res.status).toBe(500);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "Stripe live checkout is not enabled for this account yet.",
    });
  });
});

describe("POST /api/stripe/checkout — customer flow", () => {
  it("creates a new Stripe customer when none exists", async () => {
    ensureUserDoc.mockResolvedValueOnce({ stripeCustomerId: null });

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));

    expect(res.status).toBe(200);
    expect(customersCreate).toHaveBeenCalledWith({
      email: "ada@example.com",
      metadata: { firebaseUid: "u-1" },
    });
    expect(upsertUserDoc).toHaveBeenCalledWith("u-1", { stripeCustomerId: "cus_new" });
  });

  it("reuses an existing Stripe customer when present and not deleted", async () => {
    ensureUserDoc.mockResolvedValueOnce({ stripeCustomerId: "cus_existing" });
    customersRetrieve.mockResolvedValueOnce({ id: "cus_existing", deleted: false });

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));

    expect(res.status).toBe(200);
    expect(customersCreate).not.toHaveBeenCalled();
    expect(checkoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" })
    );
  });

  it("creates a fresh customer when the existing one was deleted", async () => {
    ensureUserDoc.mockResolvedValueOnce({ stripeCustomerId: "cus_old" });
    customersRetrieve.mockResolvedValueOnce({ id: "cus_old", deleted: true });

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));

    expect(res.status).toBe(200);
    expect(customersCreate).toHaveBeenCalledTimes(1);
  });

  it("creates a fresh customer when retrieve throws resource_missing", async () => {
    ensureUserDoc.mockResolvedValueOnce({ stripeCustomerId: "cus_old" });
    customersRetrieve.mockRejectedValueOnce({ code: "resource_missing" });

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));

    expect(res.status).toBe(200);
    expect(customersCreate).toHaveBeenCalledTimes(1);
  });

  it("rethrows unexpected customer-retrieve errors as a 500", async () => {
    ensureUserDoc.mockResolvedValueOnce({ stripeCustomerId: "cus_old" });
    customersRetrieve.mockRejectedValueOnce(new Error("rate limit"));

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/stripe/checkout — happy path", () => {
  it("returns 200 with the session URL", async () => {
    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "pro" }));

    expect(res.status).toBe(200);
    expect(await readJson<{ url: string }>(res)).toEqual({
      url: "https://checkout.stripe.com/session_x",
    });
    expect(checkoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: "u-1",
        mode: "subscription",
        line_items: [{ price: "price_pro_test", quantity: 1 }],
        success_url: "https://example.com/settings?checkout_session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://example.com/pricing",
      })
    );
  });
});

describe("POST /api/stripe/checkout — error mapping", () => {
  it("returns 500 with APP_URL message when getAppBaseUrl throws an APP_URL error", async () => {
    getAppBaseUrl.mockImplementationOnce(() => {
      throw new Error("APP_URL is required in production for payment redirects.");
    });

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));
    expect(res.status).toBe(500);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "App URL is not configured for payment redirects.",
    });
  });

  it("returns 500 with messageForStripeError for other Stripe errors", async () => {
    checkoutSessionsCreate.mockRejectedValueOnce(new Error("kaboom"));

    const { POST } = await import("./route");
    const res = await POST(postBody({ plan: "essential" }));
    expect(res.status).toBe(500);
  });
});
