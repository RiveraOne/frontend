import Link from "next/link";
import { mockTransactions } from "@/lib/mock-data";

export default function DashboardPage() {
  const totalIncome = mockTransactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = mockTransactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = totalIncome - totalExpenses;

  const chartData = [
    { label: "Income", value: totalIncome, color: "#38c6b3" },
    { label: "Expenses", value: totalExpenses, color: "#0b4f5a" },
    { label: "Balance", value: Math.max(remaining, 0), color: "#2a6a73" }
  ];

  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <main className="app-shell">
      <section className="app-section">
        <h1>Dashboard</h1>
        <p className="app-muted">Overview from dummy financial data.</p>

        <div className="summary-grid">
          <article className="summary-card">
            <h3>Total Income</h3>
            <p>${totalIncome.toLocaleString()}</p>
          </article>
          <article className="summary-card">
            <h3>Total Expenses</h3>
            <p>${totalExpenses.toLocaleString()}</p>
          </article>
          <article className="summary-card">
            <h3>Remaining Balance</h3>
            <p>${remaining.toLocaleString()}</p>
          </article>
        </div>

        <section className="chart-card" aria-label="Financial chart placeholder">
          <h2>Financial Snapshot</h2>
          <div className="bars">
            {chartData.map((item) => (
              <div key={item.label} className="bar-row">
                <span>{item.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(item.value / maxValue) * 100}%`, background: item.color }}
                  />
                </div>
                <strong>${item.value.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="simple-actions">
          <Link href="/ledger/new" className="btn btn-primary">
            Add Transaction
          </Link>
          <Link href="/advisor" className="btn btn-ghost">
            Ask AI
          </Link>
        </div>
      </section>
    </main>
  );
}
