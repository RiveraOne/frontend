import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({
  stripe: {
    accounts: {
      retrieveCurrent: vi.fn(),
    },
  },
}));

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.clearAllMocks();
});

describe("isMissingStripeResource", () => {
  it("returns true when error.code is 'resource_missing'", async () => {
    const { isMissingStripeResource } = await import("./errors");
    expect(isMissingStripeResource({ code: "resource_missing" })).toBe(true);
  });

  it("returns false for unrelated codes", async () => {
    const { isMissingStripeResource } = await import("./errors");
    expect(isMissingStripeResource({ code: "card_declined" })).toBe(false);
  });

  it("returns false for non-object inputs", async () => {
    const { isMissingStripeResource } = await import("./errors");
    expect(isMissingStripeResource(null)).toBe(false);
    expect(isMissingStripeResource(undefined)).toBe(false);
    expect(isMissingStripeResource("resource_missing")).toBe(false);
    expect(isMissingStripeResource(42)).toBe(false);
  });
});

describe("messageForStripeError", () => {
  it("flags test-mode key with live-mode price", async () => {
    const { messageForStripeError } = await import("./errors");
    const msg = messageForStripeError({
      code: "resource_missing",
      param: "line_items[0].price",
      message: "No such price; a similar object exists in live mode",
    });
    expect(msg).toMatch(/test secret key.*live-mode Price ID/);
  });

  it("flags live-mode key with test-mode price", async () => {
    const { messageForStripeError } = await import("./errors");
    const msg = messageForStripeError({
      code: "resource_missing",
      param: "line_items[0].price",
      message: "No such price; a similar object exists in test mode",
    });
    expect(msg).toMatch(/live secret key.*test-mode Price ID/);
  });

  it("returns generic price-not-found message for resource_missing on price", async () => {
    const { messageForStripeError } = await import("./errors");
    const msg = messageForStripeError({
      code: "resource_missing",
      param: "price",
      message: "No such price",
    });
    expect(msg).toMatch(/STRIPE_PRICE_ESSENTIAL/);
    expect(msg).toMatch(/STRIPE_PRICE_PRO/);
  });

  it("returns customer-specific message for resource_missing on customer", async () => {
    const { messageForStripeError } = await import("./errors");
    const msg = messageForStripeError({
      code: "resource_missing",
      param: "customer",
      message: "No such customer",
    });
    expect(msg).toMatch(/saved customer/);
  });

  it("returns generic missing-resource message for resource_missing without param hint", async () => {
    const { messageForStripeError } = await import("./errors");
    const msg = messageForStripeError({ code: "resource_missing", message: "missing" });
    expect(msg).toMatch(/saved billing record/);
  });

  it("flags account_invalid as 'checkout not ready'", async () => {
    const { messageForStripeError } = await import("./errors");
    const msg = messageForStripeError({ code: "account_invalid" });
    expect(msg).toMatch(/checkout is not ready/);
  });

  it("flags messages mentioning 'charges' as 'checkout not ready'", async () => {
    const { messageForStripeError } = await import("./errors");
    const msg = messageForStripeError({
      message: "Your account cannot currently make live charges",
    });
    expect(msg).toMatch(/checkout is not ready/);
  });

  it("flags StripeAuthenticationError type / 401 as invalid secret", async () => {
    const { messageForStripeError } = await import("./errors");
    expect(
      messageForStripeError({ type: "StripeAuthenticationError" })
    ).toMatch(/secret key is invalid/);
    expect(messageForStripeError({ statusCode: 401 })).toMatch(
      /secret key is invalid/
    );
  });

  it("flags StripePermissionError type / 403 as rejected", async () => {
    const { messageForStripeError } = await import("./errors");
    expect(messageForStripeError({ type: "StripePermissionError" })).toMatch(
      /rejected this billing request/
    );
    expect(messageForStripeError({ statusCode: 403 })).toMatch(
      /rejected this billing request/
    );
  });

  it("returns the supplied fallback for unknown errors", async () => {
    const { messageForStripeError } = await import("./errors");
    expect(messageForStripeError({}, "custom-fallback")).toBe("custom-fallback");
    expect(messageForStripeError(null, "custom-fallback")).toBe("custom-fallback");
    expect(messageForStripeError(undefined, "custom-fallback")).toBe("custom-fallback");
  });

  it("uses the default fallback when none provided", async () => {
    const { messageForStripeError } = await import("./errors");
    expect(messageForStripeError({})).toMatch(
      /Could not create Stripe checkout session/
    );
  });
});

describe("getStripeAccountReadinessMessage", () => {
  it("returns null when key is not a live key", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    const { getStripeAccountReadinessMessage } = await import("./errors");
    await expect(getStripeAccountReadinessMessage()).resolves.toBeNull();
  });

  it("returns null when key is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { getStripeAccountReadinessMessage } = await import("./errors");
    await expect(getStripeAccountReadinessMessage()).resolves.toBeNull();
  });

  it("returns null on live key when account.charges_enabled is true", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_abc";
    const errors = await import("./errors");
    const { stripe } = await import("./client");
    vi.mocked(stripe.accounts.retrieveCurrent).mockResolvedValueOnce({
      charges_enabled: true,
      // Stripe types are heavy; cast through unknown to satisfy the mock signature.
    } as unknown as Awaited<ReturnType<typeof stripe.accounts.retrieveCurrent>>);
    await expect(errors.getStripeAccountReadinessMessage()).resolves.toBeNull();
  });

  it("returns onboarding message on live key when charges_enabled is false", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_abc";
    const errors = await import("./errors");
    const { stripe } = await import("./client");
    vi.mocked(stripe.accounts.retrieveCurrent).mockResolvedValueOnce({
      charges_enabled: false,
    } as unknown as Awaited<ReturnType<typeof stripe.accounts.retrieveCurrent>>);
    const result = await errors.getStripeAccountReadinessMessage();
    expect(result).toMatch(/live checkout is not enabled/);
  });
});
