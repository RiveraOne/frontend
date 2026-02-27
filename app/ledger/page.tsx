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
    if (selectedMonth === "all") {
      return mockTransactions;
    }

    return mockTransactions.filter((item) => item.date.startsWith(selectedMonth));
  }, [selectedMonth]);

  return (
    <main>
      <section className="mw-shell">
        <div className="mw-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mw-title">Ledger</h1>
              <p className="mt-1 text-sm text-mw-body">Local dummy transactions only.</p>
            </div>
            <Link href="/ledger/new" className="mw-btn-primary">Add Transaction</Link>
          </div>

          <label className="mt-4 flex flex-wrap items-center gap-2" htmlFor="month-filter">
            <span className="text-sm font-semibold text-mw-light">Filter by month</span>
            <select
              id="month-filter"
              className="mw-input w-auto min-w-[150px]"
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

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[560px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-mw-border bg-[#f8fefe]">
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Category</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id} className="border-b border-mw-border/60">
                    <td className="px-3 py-3">{item.date}</td>
                    <td className="px-3 py-3">{item.type}</td>
                    <td className="px-3 py-3">${item.amount.toLocaleString()}</td>
                    <td className="px-3 py-3">{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
