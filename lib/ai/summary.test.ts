import { describe, expect, it } from "vitest";
import { buildFinancialSummary } from "./summary";
import type { AdvisorTransaction } from "./types";

const tx = (
  partial: Partial<AdvisorTransaction> & { amount: number; type: AdvisorTransaction["type"] }
): AdvisorTransaction => ({
  date: "2025-01-15",
  category: "Misc",
  ...partial,
});

describe("buildFinancialSummary", () => {
  it("returns a zeroed summary when given no transactions", () => {
    const summary = buildFinancialSummary([]);

    expect(summary).toEqual({
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
    });
  });

  it("treats undefined as no transactions (default param)", () => {
    const summary = buildFinancialSummary();
    expect(summary.transactionCount).toBe(0);
    expect(summary.balance).toBe(0);
  });

  it("totals income and expenses, computes balance", () => {
    const summary = buildFinancialSummary([
      tx({ type: "Income", amount: 1000, category: "Salary", date: "2025-01-01" }),
      tx({ type: "Income", amount: 500, category: "Freelance", date: "2025-01-05" }),
      tx({ type: "Expense", amount: 200, category: "Food", date: "2025-01-10" }),
      tx({ type: "Expense", amount: 50, category: "Coffee", date: "2025-01-12" }),
    ]);

    expect(summary.totalIncome).toBe(1500);
    expect(summary.totalExpenses).toBe(250);
    expect(summary.balance).toBe(1250);
    expect(summary.incomeCount).toBe(2);
    expect(summary.expenseCount).toBe(2);
    expect(summary.transactionCount).toBe(4);
  });

  it("rounds totals to 2 decimal places to avoid float drift", () => {
    const summary = buildFinancialSummary([
      tx({ type: "Income", amount: 0.1, category: "x", date: "2025-01-01" }),
      tx({ type: "Income", amount: 0.2, category: "x", date: "2025-01-02" }),
    ]);

    expect(summary.totalIncome).toBe(0.3);
    expect(summary.balance).toBe(0.3);
  });

  it("sorts top expense categories by total descending", () => {
    const summary = buildFinancialSummary([
      tx({ type: "Expense", amount: 10, category: "Food", date: "2025-01-01" }),
      tx({ type: "Expense", amount: 50, category: "Rent", date: "2025-01-02" }),
      tx({ type: "Expense", amount: 30, category: "Travel", date: "2025-01-03" }),
    ]);

    expect(summary.topExpenseCategories.map((c) => c.category)).toEqual([
      "Rent",
      "Travel",
      "Food",
    ]);
  });

  it("aggregates per-category counts and totals", () => {
    const summary = buildFinancialSummary([
      tx({ type: "Expense", amount: 20, category: "Food", date: "2025-01-01" }),
      tx({ type: "Expense", amount: 30, category: "Food", date: "2025-01-02" }),
      tx({ type: "Expense", amount: 40, category: "Food", date: "2025-01-03" }),
    ]);

    const food = summary.topExpenseCategories.find((c) => c.category === "Food");
    expect(food).toEqual({ category: "Food", total: 90, count: 3 });
  });

  it("limits top categories to the top 5", () => {
    const transactions: AdvisorTransaction[] = Array.from({ length: 8 }, (_, i) =>
      tx({
        type: "Expense",
        amount: i + 1,
        category: `cat-${i}`,
        date: `2025-01-0${(i % 9) + 1}`,
      })
    );

    const summary = buildFinancialSummary(transactions);
    expect(summary.topExpenseCategories).toHaveLength(5);
  });

  it("computes date range as oldest → newest", () => {
    const summary = buildFinancialSummary([
      tx({ type: "Expense", amount: 1, date: "2025-03-15" }),
      tx({ type: "Expense", amount: 1, date: "2024-11-02" }),
      tx({ type: "Expense", amount: 1, date: "2025-01-20" }),
    ]);

    expect(summary.dateRange).toEqual({ oldest: "2024-11-02", newest: "2025-03-15" });
  });

  it("returns at most 8 recent transactions", () => {
    const transactions: AdvisorTransaction[] = Array.from({ length: 12 }, (_, i) =>
      tx({
        type: "Expense",
        amount: 1,
        date: `2025-02-${String(i + 1).padStart(2, "0")}`,
        category: `c${i}`,
      })
    );

    const summary = buildFinancialSummary(transactions);
    expect(summary.recentTransactions).toHaveLength(8);
  });

  it("orders recent transactions newest-first", () => {
    const summary = buildFinancialSummary([
      tx({ type: "Expense", amount: 1, date: "2025-01-01", category: "old" }),
      tx({ type: "Expense", amount: 1, date: "2025-06-01", category: "new" }),
      tx({ type: "Expense", amount: 1, date: "2025-03-01", category: "mid" }),
    ]);

    expect(summary.recentTransactions[0].category).toBe("new");
    expect(summary.recentTransactions[2].category).toBe("old");
  });

  it("does not mutate the input array", () => {
    const transactions: AdvisorTransaction[] = [
      tx({ type: "Expense", amount: 1, date: "2025-01-01" }),
      tx({ type: "Expense", amount: 1, date: "2025-06-01" }),
    ];
    const before = JSON.stringify(transactions);

    buildFinancialSummary(transactions);

    expect(JSON.stringify(transactions)).toBe(before);
  });

  it("keeps income and expense categories segregated", () => {
    const summary = buildFinancialSummary([
      tx({ type: "Income", amount: 100, category: "Salary", date: "2025-01-01" }),
      tx({ type: "Expense", amount: 25, category: "Salary", date: "2025-01-02" }),
      // Same string category, different type — must not merge.
    ]);

    expect(summary.topIncomeCategories).toEqual([
      { category: "Salary", total: 100, count: 1 },
    ]);
    expect(summary.topExpenseCategories).toEqual([
      { category: "Salary", total: 25, count: 1 },
    ]);
  });
});
