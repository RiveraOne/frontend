export type AdvisorRole = "system" | "user" | "assistant";

export type AdvisorMessage = {
  role: Exclude<AdvisorRole, "system">;
  content: string;
};

export type AdvisorTransaction = {
  id?: string;
  date: string;
  type: "Income" | "Expense";
  amount: number;
  category: string;
  notes?: string;
  receiptUrl?: string;
};

export type AdvisorUserProfile = {
  displayName?: string | null;
  email?: string | null;
  plan?: string | null;
};

export type CategorySpend = {
  category: string;
  total: number;
  count: number;
};

export type FinancialSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  expenseCount: number;
  incomeCount: number;
  dateRange: {
    oldest: string | null;
    newest: string | null;
  };
  topExpenseCategories: CategorySpend[];
  topIncomeCategories: CategorySpend[];
  recentTransactions: AdvisorTransaction[];
};

export type AdvisorRequest = {
  messages: AdvisorMessage[];
  transactions?: AdvisorTransaction[];
  userProfile?: AdvisorUserProfile;
};

export type AdvisorResponse = {
  reply: AdvisorMessage;
  meta: {
    provider: "ollama";
    model: string;
    transactionCount: number;
    generatedAt: string;
    summary: FinancialSummary;
  };
};
