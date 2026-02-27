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
    <main>
      <section className="mw-shell">
        <div className="mw-card p-6">
          <h1 className="mw-title">Dashboard</h1>
          <p className="mt-1 text-sm text-mw-body">Overview from dummy financial data.</p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-mw-border bg-[#fbfefe] p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-mw-light">Total Income</h3>
              <p className="mt-2 text-3xl font-black text-mw-primary">${totalIncome.toLocaleString()}</p>
            </article>
            <article className="rounded-xl border border-mw-border bg-[#fbfefe] p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-mw-light">Total Expenses</h3>
              <p className="mt-2 text-3xl font-black text-mw-primary">${totalExpenses.toLocaleString()}</p>
            </article>
            <article className="rounded-xl border border-mw-border bg-[#fbfefe] p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-mw-light">Remaining Balance</h3>
              <p className="mt-2 text-3xl font-black text-mw-primary">${remaining.toLocaleString()}</p>
            </article>
          </div>

          <section className="mt-4 rounded-xl border border-mw-border p-4" aria-label="Financial chart placeholder">
            <h2 className="text-base font-bold text-mw-primary">Financial Snapshot</h2>
            <div className="mt-3 grid gap-3">
              {chartData.map((item) => (
                <div key={item.label} className="grid gap-2 sm:grid-cols-[88px_1fr_auto] sm:items-center">
                  <span className="text-xs font-semibold text-mw-light">{item.label}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e7f6f6]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(item.value / maxValue) * 100}%`, background: item.color }}
                    />
                  </div>
                  <strong className="text-xs text-mw-primary sm:text-sm">${item.value.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/ledger/new" className="mw-btn-primary">Add Transaction</Link>
            <Link href="/advisor" className="mw-btn-ghost">Ask AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
