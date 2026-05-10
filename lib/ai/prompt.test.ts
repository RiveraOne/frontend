import { describe, expect, it } from "vitest";
import { buildAdvisorSystemPrompt, buildConversation } from "./prompt";
import type { FinancialSummary, AdvisorMessage } from "./types";

const emptySummary: FinancialSummary = {
  totalIncome: 0,
  totalExpenses: 0,
  balance: 0,
  transactionCount: 0,
  expenseCount: 0,
  incomeCount: 0,
  dateRange: { oldest: null, newest: null },
  topExpenseCategories: [],
  topIncomeCategories: [],
  recentTransactions: [],
};

describe("buildAdvisorSystemPrompt", () => {
  it("includes the not-an-advisor disclaimer", () => {
    const out = buildAdvisorSystemPrompt({ summary: emptySummary });
    expect(out).toMatch(/not a licensed financial advisor/);
  });

  it("includes the no-invent guard", () => {
    const out = buildAdvisorSystemPrompt({ summary: emptySummary });
    expect(out).toMatch(/Do not invent balances/);
  });

  it("renders 'unknown' when no userProfile is supplied", () => {
    const out = buildAdvisorSystemPrompt({ summary: emptySummary });
    expect(out).toMatch(/User plan: unknown/);
    expect(out).toMatch(/User display name: unknown/);
    expect(out).toMatch(/User email: unknown/);
  });

  it("substitutes user profile fields when supplied", () => {
    const out = buildAdvisorSystemPrompt({
      userProfile: { plan: "pro", displayName: "Ada", email: "ada@example.com" },
      summary: emptySummary,
    });
    expect(out).toMatch(/User plan: pro/);
    expect(out).toMatch(/User display name: Ada/);
    expect(out).toMatch(/User email: ada@example.com/);
  });

  it("renders 'n/a' for missing date range", () => {
    const out = buildAdvisorSystemPrompt({ summary: emptySummary });
    expect(out).toMatch(/Date range: n\/a to n\/a/);
  });

  it("renders 'none' for empty top categories", () => {
    const out = buildAdvisorSystemPrompt({ summary: emptySummary });
    expect(out).toMatch(/Top expense categories: none/);
    expect(out).toMatch(/Top income categories: none/);
    expect(out).toMatch(/Recent transactions: none/);
  });

  it("renders categories with totals and counts when populated", () => {
    const summary: FinancialSummary = {
      ...emptySummary,
      topExpenseCategories: [
        { category: "Rent", total: 1200, count: 1 },
        { category: "Food", total: 350, count: 12 },
      ],
    };
    const out = buildAdvisorSystemPrompt({ summary });
    expect(out).toMatch(/Top expense categories: Rent \(\$1200, 1 tx\), Food \(\$350, 12 tx\)/);
  });

  it("renders recent transactions inline with date|type|category|amount", () => {
    const summary: FinancialSummary = {
      ...emptySummary,
      recentTransactions: [
        { date: "2025-03-01", type: "Expense", amount: 12.5, category: "Coffee" },
        { date: "2025-02-28", type: "Income", amount: 1000, category: "Salary" },
      ],
    };
    const out = buildAdvisorSystemPrompt({ summary });
    expect(out).toMatch(/2025-03-01 Expense Coffee \$12\.5/);
    expect(out).toMatch(/2025-02-28 Income Salary \$1000/);
  });

  it("includes top-line aggregates", () => {
    const summary: FinancialSummary = {
      ...emptySummary,
      totalIncome: 2000,
      totalExpenses: 750,
      balance: 1250,
      transactionCount: 5,
      incomeCount: 1,
      expenseCount: 4,
      dateRange: { oldest: "2025-01-01", newest: "2025-01-31" },
    };
    const out = buildAdvisorSystemPrompt({ summary });
    expect(out).toMatch(/Total income: \$2000/);
    expect(out).toMatch(/Total expenses: \$750/);
    expect(out).toMatch(/Balance: \$1250/);
    expect(out).toMatch(/Transactions available: 5/);
    expect(out).toMatch(/Date range: 2025-01-01 to 2025-01-31/);
  });
});

describe("buildConversation", () => {
  it("trims content of each message", () => {
    const messages: AdvisorMessage[] = [
      { role: "user", content: "  hello  " },
      { role: "assistant", content: "\n\thi\n" },
    ];
    expect(buildConversation(messages)).toEqual([
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi" },
    ]);
  });

  it("preserves role exactly", () => {
    const messages: AdvisorMessage[] = [
      { role: "user", content: "a" },
      { role: "assistant", content: "b" },
    ];
    const out = buildConversation(messages);
    expect(out[0].role).toBe("user");
    expect(out[1].role).toBe("assistant");
  });

  it("returns an empty array for empty input", () => {
    expect(buildConversation([])).toEqual([]);
  });

  it("does not mutate the input messages", () => {
    const messages: AdvisorMessage[] = [{ role: "user", content: "  hi  " }];
    const before = JSON.stringify(messages);
    buildConversation(messages);
    expect(JSON.stringify(messages)).toBe(before);
  });
});
