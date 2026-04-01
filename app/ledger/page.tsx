"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToTransactions, type Transaction } from "@/lib/firebase";

export default function LedgerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
      setTxLoading(false);
    });
    return unsub;
  }, [user]);

  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date.slice(0, 7)));
    return ["all", ...Array.from(set).sort().reverse()];
  }, [transactions]);

  const filtered = useMemo(() => {
    if (selectedMonth === "all") return transactions;
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [filtered]
  );

  const totalIncome = filtered.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const isLoading = authLoading || txLoading;

  return (
    <ProtectedRoute>
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
            <p className="mt-1 text-xl font-black text-teal-700 dark:text-teal-300">
              {isLoading ? <span className="inline-block h-6 w-20 animate-pulse rounded bg-teal-200 dark:bg-teal-800" /> : `+$${totalIncome.toLocaleString()}`}
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900 dark:bg-rose-950/30">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Expenses</p>
            <p className="mt-1 text-xl font-black text-rose-700 dark:text-rose-300">
              {isLoading ? <span className="inline-block h-6 w-20 animate-pulse rounded bg-rose-200 dark:bg-rose-800" /> : `-$${totalExpenses.toLocaleString()}`}
            </p>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${balance >= 0 ? "border-mw-border bg-mw-soft" : "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Balance</p>
            <p className={`mt-1 text-xl font-black ${balance >= 0 ? "text-mw-primary" : "text-rose-700"}`}>
              {isLoading ? <span className="inline-block h-6 w-20 animate-pulse rounded bg-mw-border" /> : `$${Math.abs(balance).toLocaleString()}${balance < 0 ? " deficit" : ""}`}
            </p>
          </div>
        </div>

        <div className="mw-card overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mw-border px-5 py-4">
            <p className="text-sm font-bold text-mw-primary">
              {isLoading ? "Loading…" : `${sorted.length} ${sorted.length === 1 ? "transaction" : "transactions"}`}
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
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-mw-border/50">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 animate-pulse rounded bg-mw-border" style={{ width: j === 4 ? "16px" : "60%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <>
                    {sorted.map((item, i) => (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/ledger/${item.id}`)}
                        className={`cursor-pointer border-b border-mw-border/50 transition-colors hover:bg-mw-soft ${i % 2 === 0 ? "" : "bg-mw-soft/40"}`}
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
                        <td className="px-5 py-3.5 text-right text-mw-light">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </td>
                      </tr>
                    ))}
                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center">
                          <p className="text-sm font-semibold text-mw-primary">No transactions yet</p>
                          <p className="mt-1 text-xs text-mw-body">Add your first transaction to get started.</p>
                          <Link href="/ledger/new" className="mw-btn-primary mt-4 inline-flex">
                            Add Transaction
                          </Link>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
    </ProtectedRoute>
  );
}
