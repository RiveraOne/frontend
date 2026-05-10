import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("PLAN_CONFIG", () => {
  it("free plan has a 5-query monthly limit and no priceId", async () => {
    const { PLAN_CONFIG } = await import("./config");
    expect(PLAN_CONFIG.free.monthlyLimit).toBe(5);
    expect(PLAN_CONFIG.free.priceId).toBeNull();
    expect(PLAN_CONFIG.free.label).toBe("Free");
  });

  it("essential plan has a 50-query monthly limit", async () => {
    const { PLAN_CONFIG } = await import("./config");
    expect(PLAN_CONFIG.essential.monthlyLimit).toBe(50);
    expect(PLAN_CONFIG.essential.label).toBe("Essential");
  });

  it("pro plan has unlimited (Infinity) queries", async () => {
    const { PLAN_CONFIG } = await import("./config");
    expect(PLAN_CONFIG.pro.monthlyLimit).toBe(Infinity);
    expect(PLAN_CONFIG.pro.label).toBe("Pro");
  });

  it("picks up STRIPE_PRICE_ESSENTIAL and STRIPE_PRICE_PRO from env", async () => {
    process.env.STRIPE_PRICE_ESSENTIAL = "price_essential_test";
    process.env.STRIPE_PRICE_PRO = "price_pro_test";
    const { PLAN_CONFIG } = await import("./config");
    expect(PLAN_CONFIG.essential.priceId).toBe("price_essential_test");
    expect(PLAN_CONFIG.pro.priceId).toBe("price_pro_test");
  });

  it("falls back to null when env vars are missing", async () => {
    delete process.env.STRIPE_PRICE_ESSENTIAL;
    delete process.env.STRIPE_PRICE_PRO;
    const { PLAN_CONFIG } = await import("./config");
    expect(PLAN_CONFIG.essential.priceId).toBeNull();
    expect(PLAN_CONFIG.pro.priceId).toBeNull();
  });
});

describe("planFromPriceId", () => {
  it("returns 'essential' when priceId matches STRIPE_PRICE_ESSENTIAL", async () => {
    process.env.STRIPE_PRICE_ESSENTIAL = "price_essential_test";
    process.env.STRIPE_PRICE_PRO = "price_pro_test";
    const { planFromPriceId } = await import("./config");
    expect(planFromPriceId("price_essential_test")).toBe("essential");
  });

  it("returns 'pro' when priceId matches STRIPE_PRICE_PRO", async () => {
    process.env.STRIPE_PRICE_ESSENTIAL = "price_essential_test";
    process.env.STRIPE_PRICE_PRO = "price_pro_test";
    const { planFromPriceId } = await import("./config");
    expect(planFromPriceId("price_pro_test")).toBe("pro");
  });

  it("returns null when priceId is unrecognized", async () => {
    process.env.STRIPE_PRICE_ESSENTIAL = "price_essential_test";
    process.env.STRIPE_PRICE_PRO = "price_pro_test";
    const { planFromPriceId } = await import("./config");
    expect(planFromPriceId("price_unknown")).toBeNull();
    expect(planFromPriceId("")).toBeNull();
  });

  it("never resolves an empty/null configured priceId to a plan", async () => {
    delete process.env.STRIPE_PRICE_ESSENTIAL;
    delete process.env.STRIPE_PRICE_PRO;
    const { planFromPriceId } = await import("./config");
    // free's priceId is null hard-coded; passing null/empty string must not match.
    expect(planFromPriceId("")).toBeNull();
  });
});
