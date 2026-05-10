import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  delete process.env.AI_ADVISOR_MAX_MESSAGES;
  delete process.env.AI_ADVISOR_MAX_TRANSACTIONS;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("aiConfig defaults", () => {
  it("openaiApiKey defaults to empty string when env unset", async () => {
    const { aiConfig } = await import("./config");
    expect(aiConfig.openaiApiKey).toBe("");
  });

  it("openaiModel defaults to gpt-4.1-nano when env unset", async () => {
    const { aiConfig } = await import("./config");
    expect(aiConfig.openaiModel).toBe("gpt-4.1-nano");
  });

  it("maxMessages defaults to 8", async () => {
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxMessages).toBe(8);
  });

  it("maxTransactions defaults to 100", async () => {
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxTransactions).toBe(100);
  });
});

describe("aiConfig — env var overrides", () => {
  it("uses OPENAI_API_KEY when set", async () => {
    process.env.OPENAI_API_KEY = "sk-test-123";
    const { aiConfig } = await import("./config");
    expect(aiConfig.openaiApiKey).toBe("sk-test-123");
  });

  it("uses OPENAI_MODEL when set", async () => {
    process.env.OPENAI_MODEL = "gpt-5-mega";
    const { aiConfig } = await import("./config");
    expect(aiConfig.openaiModel).toBe("gpt-5-mega");
  });

  it("parses positive AI_ADVISOR_MAX_MESSAGES", async () => {
    process.env.AI_ADVISOR_MAX_MESSAGES = "20";
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxMessages).toBe(20);
  });

  it("parses positive AI_ADVISOR_MAX_TRANSACTIONS", async () => {
    process.env.AI_ADVISOR_MAX_TRANSACTIONS = "250";
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxTransactions).toBe(250);
  });
});

describe("aiConfig — invalid integers fall back to defaults", () => {
  it("rejects 0", async () => {
    process.env.AI_ADVISOR_MAX_MESSAGES = "0";
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxMessages).toBe(8);
  });

  it("rejects negative numbers", async () => {
    process.env.AI_ADVISOR_MAX_MESSAGES = "-5";
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxMessages).toBe(8);
  });

  it("rejects non-numeric strings", async () => {
    process.env.AI_ADVISOR_MAX_TRANSACTIONS = "abc";
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxTransactions).toBe(100);
  });

  it("rejects empty string", async () => {
    process.env.AI_ADVISOR_MAX_MESSAGES = "";
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxMessages).toBe(8);
  });

  it("parses floats by truncating to int (parseInt behavior)", async () => {
    process.env.AI_ADVISOR_MAX_MESSAGES = "12.7";
    const { aiConfig } = await import("./config");
    expect(aiConfig.maxMessages).toBe(12);
  });
});
