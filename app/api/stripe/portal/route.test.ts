import { beforeEach, describe, expect, it, vi } from "vitest";
import { bearer, makeRequest, readJson } from "@/app/api/__test-helpers__";

const verifyIdToken = vi.fn();
const ensureUserDoc = vi.fn();
const upsertUserDoc = vi.fn();
const getAppBaseUrl = vi.fn();
const customersRetrieve = vi.fn();
const billingPortalSessionsCreate = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: { verifyIdToken },
  adminDb: { collection: vi.fn() },
}));
vi.mock("@/lib/firebase/userDoc", () => ({ ensureUserDoc, upsertUserDoc }));
vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    customers: { retrieve: customersRetrieve },
    billingPortal: { sessions: { create: billingPortalSessionsCreate } },
  },
}));
vi.mock("@/lib/routes/appUrl", () => ({ getAppBaseUrl }));
vi.mock("@/lib/stripe/errors", () => ({
  isMissingStripeResource: (e: unknown) =>
    typeof e === "object" && e !== null && (e as { code?: string }).code === "resource_missing",
  messageForStripeError: (_e: unknown, fallback?: string) =>
    fallback ?? "stripe-error",
}));

const URL_ = "http://localhost:3000/api/stripe/portal";

beforeEach(() => {
  vi.clearAllMocks();
  verifyIdToken.mockResolvedValue({ uid: "u-1", email: "ada@example.com", name: "Ada" });
  ensureUserDoc.mockResolvedValue({ stripeCustomerId: "cus_1" });
  getAppBaseUrl.mockReturnValue("https://example.com");
  customersRetrieve.mockResolvedValue({ id: "cus_1", deleted: false });
  billingPortalSessionsCreate.mockResolvedValue({ url: "https://billing.stripe.com/portal_x" });
});

function postEmpty(opts: { token?: string; noAuth?: boolean } = {}): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!opts.noAuth) Object.assign(headers, bearer(opts.token ?? "good"));
  return makeRequest(URL_, { method: "POST", headers, body: "{}" });
}

describe("POST /api/stripe/portal — auth", () => {
  it("returns 401 when no Authorization header", async () => {
    const { POST } = await import("./route");
    const res = await POST(postEmpty({ noAuth: true }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when verifyIdToken throws", async () => {
    verifyIdToken.mockRejectedValueOnce(new Error("bad"));
    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(401);
  });

  it("returns 401 when Authorization is non-Bearer", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest(URL_, {
        method: "POST",
        headers: { Authorization: "Basic x", "Content-Type": "application/json" },
        body: "{}",
      })
    );
    expect(res.status).toBe(401);
  });
});

describe("POST /api/stripe/portal — customer state", () => {
  it("returns 404 when the user has no stripeCustomerId", async () => {
    ensureUserDoc.mockResolvedValueOnce({ stripeCustomerId: null });
    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(404);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "No billing account found",
    });
  });

  it("returns 404 and clears stripeCustomerId when the customer was deleted", async () => {
    customersRetrieve.mockResolvedValueOnce({ id: "cus_1", deleted: true });

    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(404);
    expect(upsertUserDoc).toHaveBeenCalledWith("u-1", { stripeCustomerId: null });
  });

  it("returns 404 and clears stripeCustomerId when retrieve throws resource_missing", async () => {
    customersRetrieve.mockRejectedValueOnce({ code: "resource_missing" });

    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(404);
    expect(upsertUserDoc).toHaveBeenCalledWith("u-1", { stripeCustomerId: null });
  });
});

describe("POST /api/stripe/portal — happy path", () => {
  it("returns 200 with the portal session URL", async () => {
    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(200);
    expect(await readJson<{ url: string }>(res)).toEqual({
      url: "https://billing.stripe.com/portal_x",
    });
    expect(billingPortalSessionsCreate).toHaveBeenCalledWith({
      customer: "cus_1",
      return_url: "https://example.com/settings",
    });
  });
});

describe("POST /api/stripe/portal — error mapping", () => {
  it("returns 500 with APP_URL message when getAppBaseUrl throws an APP_URL error", async () => {
    getAppBaseUrl.mockImplementationOnce(() => {
      throw new Error("APP_URL is required in production for payment redirects.");
    });

    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(500);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "App URL is not configured for billing redirects.",
    });
  });

  it("returns 500 with messageForStripeError fallback for other Stripe errors", async () => {
    billingPortalSessionsCreate.mockRejectedValueOnce(new Error("kaboom"));
    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(500);
    expect(await readJson<{ error: string }>(res)).toEqual({
      error: "Could not create Stripe billing portal session. Please try again.",
    });
  });
});
