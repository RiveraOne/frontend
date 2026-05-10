import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const StripeCtor = vi.fn();
vi.mock("stripe", () => ({
  default: class MockStripe {
    constructor(...args: unknown[]) {
      StripeCtor(...args);
    }
  },
}));

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  StripeCtor.mockReset();
  process.env = { ...originalEnv };
  delete process.env.STRIPE_SECRET_KEY;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("stripe client init", () => {
  it("throws on import when STRIPE_SECRET_KEY is missing", async () => {
    await expect(import("./client")).rejects.toThrow(/STRIPE_SECRET_KEY is not set/);
  });

  it("constructs a Stripe instance with the configured apiVersion when key is set", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    await import("./client");

    expect(StripeCtor).toHaveBeenCalledTimes(1);
    expect(StripeCtor).toHaveBeenCalledWith(
      "sk_test_x",
      expect.objectContaining({ apiVersion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/) })
    );
  });

  it("re-evaluates env when modules are reset", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_first";
    await import("./client");
    expect(StripeCtor).toHaveBeenLastCalledWith("sk_test_first", expect.any(Object));

    vi.resetModules();
    process.env.STRIPE_SECRET_KEY = "sk_test_second";
    await import("./client");
    expect(StripeCtor).toHaveBeenLastCalledWith("sk_test_second", expect.any(Object));
  });
});
