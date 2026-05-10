import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();
const ctorMock = vi.fn();

vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: createMock } };
    constructor(opts: { apiKey: string }) {
      ctorMock(opts);
    }
  },
}));

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  createMock.mockReset();
  ctorMock.mockReset();
  process.env = { ...originalEnv };
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("generateWithOpenAI", () => {
  it("throws when OPENAI_API_KEY is not set on first call", async () => {
    const { generateWithOpenAI } = await import("./openai");
    await expect(
      generateWithOpenAI([{ role: "user", content: "hi" }])
    ).rejects.toThrow(/OPENAI_API_KEY is not set/);
  });

  it("trims and returns the assistant content on success", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: "  hello world  " } }],
    });

    const { generateWithOpenAI } = await import("./openai");
    const result = await generateWithOpenAI([{ role: "user", content: "hi" }]);
    expect(result).toBe("hello world");
  });

  it("throws when the API returns empty content", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: "   " } }],
    });

    const { generateWithOpenAI } = await import("./openai");
    await expect(
      generateWithOpenAI([{ role: "user", content: "hi" }])
    ).rejects.toThrow(/empty response/);
  });

  it("throws when choices is empty", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    createMock.mockResolvedValueOnce({ choices: [] });

    const { generateWithOpenAI } = await import("./openai");
    await expect(
      generateWithOpenAI([{ role: "user", content: "hi" }])
    ).rejects.toThrow(/empty response/);
  });

  it("uses aiConfig.openaiModel for the request", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.OPENAI_MODEL = "gpt-test";
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: "ok" } }],
    });

    const { generateWithOpenAI } = await import("./openai");
    await generateWithOpenAI([
      { role: "system", content: "sys" },
      { role: "user", content: "hi" },
    ]);

    expect(createMock).toHaveBeenCalledWith({
      model: "gpt-test",
      messages: [
        { role: "system", content: "sys" },
        { role: "user", content: "hi" },
      ],
    });
  });

  it("memoizes the OpenAI client across calls (only one constructor)", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    createMock.mockResolvedValue({
      choices: [{ message: { content: "ok" } }],
    });

    const { generateWithOpenAI } = await import("./openai");
    await generateWithOpenAI([{ role: "user", content: "1" }]);
    await generateWithOpenAI([{ role: "user", content: "2" }]);
    await generateWithOpenAI([{ role: "user", content: "3" }]);

    expect(ctorMock).toHaveBeenCalledTimes(1);
    expect(ctorMock).toHaveBeenCalledWith({ apiKey: "sk-test" });
    expect(createMock).toHaveBeenCalledTimes(3);
  });
});
