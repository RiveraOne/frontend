export type LedgerEntry = {
  id: string;
  date: string;
  type: "Income" | "Expense";
  amount: number;
  category: string;
};

export const mockTransactions: LedgerEntry[] = [
  { id: "t1", date: "2026-02-01", type: "Income", amount: 4800, category: "Salary" },
  { id: "t2", date: "2026-02-03", type: "Expense", amount: 950, category: "Rent" },
  { id: "t3", date: "2026-02-07", type: "Expense", amount: 180, category: "Groceries" },
  { id: "t4", date: "2026-02-10", type: "Expense", amount: 70, category: "Transport" },
  { id: "t5", date: "2026-02-15", type: "Income", amount: 350, category: "Freelance" },
  { id: "t6", date: "2026-02-18", type: "Expense", amount: 120, category: "Utilities" },
  { id: "t7", date: "2026-01-20", type: "Expense", amount: 220, category: "Shopping" }
];

export const mockUser = {
  name: "Alex Rivera",
  email: "alex@metrawealth.app",
  subscription: "Free"
};
