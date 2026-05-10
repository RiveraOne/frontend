import { beforeEach, describe, expect, it, vi } from "vitest";

const generateWithOpenAI = vi.fn();

vi.mock("./openai", () => ({
  generateWithOpenAI: (...args: unknown[]) => generateWithOpenAI(...args),
}));

import { generateAdvisorReply } from "./advisor";
import { aiConfig } from "./config";
import type { AdvisorTransaction } from "./types";

beforeEach(() => {
  generateWithOpenAI.mockReset();
});

describe("generateAdvisorReply", () => {
  it("returns the assistant reply with provider/model/transactionCount meta", async () => {
    generateWithOpenAI.mockResolvedValueOnce("Here's some advice.");

    const result = await generateAdvisorReply({
      messages: [{ role: "user", content: "How am I doing?" }],
      transactions: [],
      userProfile: { plan: "pro", displayName: "Ada", email: "ada@example.com" },
    });

    expect(result.reply).toEqual({ role: "assistant", content: "Here's some advice." });
    expect(result.meta.provider).toBe("openai");
    expect(result.meta.model).toBe(aiConfig.openaiModel);
    expect(result.meta.transactionCount).toBe(0);
    expect(result.meta.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.meta.summary.totalIncome).toBe(0);
  });

  it("passes the system prompt as the first message", async () => {
    generateWithOpenAI.mockResolvedValueOnce("ok");

    await generateAdvisorReply({
      messages: [{ role: "user", content: "hi" }],
      transactions: [],
      userProfile: { plan: "essential", displayName: "Lin", email: "lin@example.com" },
    });

    const sentMessages = generateWithOpenAI.mock.calls[0][0] as Array<{
      role: string;
      content: string;
    }>;
    expect(sentMessages[0].role).toBe("system");
    expect(sentMessages[0].content).toMatch(/Metra Wealth/);
    expect(sentMessages[0].content).toMatch(/User plan: essential/);
    expect(sentMessages[0].content).toMatch(/User display name: Lin/);
  });

  it("trims user/assistant message contents in the conversation", async () => {
    generateWithOpenAI.mockResolvedValueOnce("ok");

    await generateAdvisorReply({
      messages: [
        { role: "user", content: "  whitespace user  " },
        { role: "assistant", content: "\n  whitespace assistant\t" },
      ],
      transactions: [],
    });

    const sent = generateWithOpenAI.mock.calls[0][0] as Array<{
      role: string;
      content: string;
    }>;
    expect(sent[1]).toEqual({ role: "user", content: "whitespace user" });
    expect(sent[2]).toEqual({ role: "assistant", content: "whitespace assistant" });
  });

  it("limits conversation history to aiConfig.maxMessages", async () => {
    generateWithOpenAI.mockResolvedValueOnce("ok");

    const overflowing = Array.from({ length: aiConfig.maxMessages + 5 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `msg-${i}`,
    }));

    await generateAdvisorReply({
      messages: overflowing,
      transactions: [],
    });

    const sent = generateWithOpenAI.mock.calls[0][0] as Array<{
      role: string;
      content: string;
    }>;
    // 1 system + last `maxMessages` of the user/assistant turns.
    expect(sent.length).toBe(1 + aiConfig.maxMessages);
    expect(sent.at(-1)?.content).toBe(`msg-${overflowing.length - 1}`);
  });

  it("integrates buildFinancialSummary into meta.summary", async () => {
    generateWithOpenAI.mockResolvedValueOnce("ok");

    const transactions: AdvisorTransaction[] = [
      { type: "Income", amount: 1000, category: "Salary", date: "2025-01-01" },
      { type: "Expense", amount: 200, category: "Food", date: "2025-01-15" },
    ];

    const result = await generateAdvisorReply({
      messages: [{ role: "user", content: "hi" }],
      transactions,
    });

    expect(result.meta.summary.totalIncome).toBe(1000);
    expect(result.meta.summary.totalExpenses).toBe(200);
    expect(result.meta.summary.balance).toBe(800);
    expect(result.meta.summary.transactionCount).toBe(2);
  });

  it("treats missing transactions as an empty list", async () => {
    generateWithOpenAI.mockResolvedValueOnce("ok");

    const result = await generateAdvisorReply({
      messages: [{ role: "user", content: "hi" }],
    });

    expect(result.meta.transactionCount).toBe(0);
  });

  it("propagates errors from generateWithOpenAI", async () => {
    generateWithOpenAI.mockRejectedValueOnce(new Error("api down"));

    await expect(
      generateAdvisorReply({
        messages: [{ role: "user", content: "hi" }],
        transactions: [],
      })
    ).rejects.toThrow(/api down/);
  });
});
