import { aiConfig } from "@/lib/ai/config";
import type {
  AdvisorTransaction,
  CategorySpend,
  FinancialSummary,
} from "@/lib/ai/types";

function toSortedCategorySpend(
  categories: Map<string, { total: number; count: number }>
): CategorySpend[] {
  return Array.from(categories.entries())
    .map(([category, data]) => ({
      category,
      total: Number(data.total.toFixed(2)),
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

export function buildFinancialSummary(
  transactions: AdvisorTransaction[] = []
): FinancialSummary {
  const limitedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, aiConfig.maxTransactions);

  const expenseCategories = new Map<string, { total: number; count: number }>();
  const incomeCategories = new Map<string, { total: number; count: number }>();

  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const transaction of limitedTransactions) {
    const targetMap =
      transaction.type === "Income" ? incomeCategories : expenseCategories;
    const current = targetMap.get(transaction.category) || { total: 0, count: 0 };

    current.total += transaction.amount;
    current.count += 1;
    targetMap.set(transaction.category, current);

    if (transaction.type === "Income") {
      totalIncome += transaction.amount;
      incomeCount += 1;
    } else {
      totalExpenses += transaction.amount;
      expenseCount += 1;
    }
  }

  const sortedByDate = [...limitedTransactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    balance: Number((totalIncome - totalExpenses).toFixed(2)),
    transactionCount: limitedTransactions.length,
    expenseCount,
    incomeCount,
    dateRange: {
      oldest: sortedByDate[0]?.date || null,
      newest: sortedByDate[sortedByDate.length - 1]?.date || null,
    },
    topExpenseCategories: toSortedCategorySpend(expenseCategories),
    topIncomeCategories: toSortedCategorySpend(incomeCategories),
    recentTransactions: limitedTransactions.slice(0, 8),
  };
}
