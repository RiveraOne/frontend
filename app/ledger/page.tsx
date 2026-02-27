"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { mockTransactions } from "@/lib/mock-data";

export default function LedgerPage() {
  const [selectedMonth, setSelectedMonth] = useState("all");

  const months = useMemo(() => {
    const set = new Set(mockTransactions.map((item) => item.date.slice(0, 7)));
    return ["all", ...Array.from(set).sort().reverse()];
  }, []);

  const transactions = useMemo(() => {
    if (selectedMonth === "all") return mockTransactions;
    return mockTransactions.filter((item) => item.date.startsWith(selectedMonth));
  }, [selectedMonth]);

  const totalIncome = transactions.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  return (
    <main>
      <section className="mw-shell">
        {/* Page header */}
        <div className="mw-page-header">
          <div>
            <p className="mw-section-label mb-0.5">Finance</p>
            <h1 className="mw-title">Ledger</h1>
            <p className="mt-1 text-sm text-mw-body">Your complete transaction history.</p>
          </div>
          <Link href="/ledger/new" className="mw-btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Add Transaction
          </Link>
        </div>

        {/* Summary stats */}
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-900 dark:bg-teal-950/30">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Income</p>
            <p className="mt-1 text-xl font-black text-teal-700 dark:text-teal-300">+${totalIncome.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900 dark:bg-rose-950/30">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Expenses</p>
            <p className="mt-1 text-xl font-black text-rose-700 dark:text-rose-300">-${totalExpenses.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${balance >= 0 ? "border-mw-border bg-mw-soft" : "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Balance</p>
            <p className={`mt-1 text-xl font-black ${balance >= 0 ? "text-mw-primary" : "text-rose-700"}`}>
              ${Math.abs(balance).toLocaleString()}
              {balance < 0 && <span className="ml-1 text-sm font-semibold"> deficit</span>}
            </p>
          </div>
        </div>

        <div className="mw-card overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mw-border px-5 py-4">
            <p className="text-sm font-bold text-mw-primary">
              {sorted.length} {sorted.length === 1 ? "transaction" : "transactions"}
            </p>
            <label className="flex items-center gap-2" htmlFor="month-filter">
              <span className="text-xs font-semibold text-mw-light">Filter:</span>
              <select
                id="month-filter"
                className="mw-input w-auto min-w-[140px] py-1.5 text-xs"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month === "all" ? "All months" : month}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-mw-border bg-mw-soft">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-mw-light">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-mw-light">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-mw-light">Category</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-mw-light">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-b border-mw-border/50 transition-colors hover:bg-mw-soft ${i % 2 === 0 ? "" : "bg-mw-soft/40"}`}
                  >
                    <td className="px-5 py-3.5 text-sm text-mw-body">{item.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={item.type === "Income" ? "mw-badge-income" : "mw-badge-expense"}>
                        {item.type === "Income" ? "↑" : "↓"} {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-mw-dark">{item.category}</td>
                    <td className={`px-5 py-3.5 text-right text-sm font-bold ${item.type === "Income" ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {item.type === "Income" ? "+" : "-"}${item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-mw-body">
                      No transactions for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
