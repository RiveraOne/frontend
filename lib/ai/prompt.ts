import type {
  AdvisorMessage,
  AdvisorUserProfile,
  FinancialSummary,
} from "@/lib/ai/types";

function formatCategorySection(
  label: string,
  items: FinancialSummary["topExpenseCategories"]
) {
  if (items.length === 0) {
    return `${label}: none`;
  }

  return `${label}: ${items
    .map((item) => `${item.category} ($${item.total}, ${item.count} tx)`)
    .join(", ")}`;
}

function formatRecentTransactions(summary: FinancialSummary) {
  if (summary.recentTransactions.length === 0) {
    return "Recent transactions: none";
  }

  return `Recent transactions: ${summary.recentTransactions
    .map(
      (transaction) =>
        `${transaction.date} ${transaction.type} ${transaction.category} $${transaction.amount}`
    )
    .join(" | ")}`;
}

export function buildAdvisorSystemPrompt(args: {
  userProfile?: AdvisorUserProfile;
  summary: FinancialSummary;
}) {
  const { userProfile, summary } = args;

  return [
    "You are Metra Wealth's budgeting assistant.",
    "You help with spending checks, budgeting, saving, and debt planning.",
    "You are not a licensed financial advisor.",
    "Do not present legal, tax, or investment advice as professional advice.",
    "Base your answer on the supplied financial context when it exists.",
    "If the context is missing or insufficient, say so clearly.",
    "Do not invent balances, salary, bills, account data, or goals.",
    "Keep responses practical and concise.",
    "When useful, provide 2 to 4 concrete next steps.",
    "Include a short reminder that this is planning support, not financial advice, for high-stakes decisions.",
    "",
    `User plan: ${userProfile?.plan || "unknown"}`,
    `User display name: ${userProfile?.displayName || "unknown"}`,
    `User email: ${userProfile?.email || "unknown"}`,
    `Transactions available: ${summary.transactionCount}`,
    `Date range: ${summary.dateRange.oldest || "n/a"} to ${summary.dateRange.newest || "n/a"}`,
    `Total income: $${summary.totalIncome}`,
    `Total expenses: $${summary.totalExpenses}`,
    `Balance: $${summary.balance}`,
    `Income transaction count: ${summary.incomeCount}`,
    `Expense transaction count: ${summary.expenseCount}`,
    formatCategorySection("Top expense categories", summary.topExpenseCategories),
    formatCategorySection("Top income categories", summary.topIncomeCategories),
    formatRecentTransactions(summary),
  ].join("\n");
}

export function buildConversation(messages: AdvisorMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));
}
