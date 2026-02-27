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
    <main className="app-shell">
      <section className="app-section">
        <div className="section-head">
          <div>
            <h1>Ledger</h1>
            <p className="app-muted">Local dummy transactions only.</p>
          </div>
          <Link href="/ledger/new" className="btn btn-primary">
            Add Transaction
          </Link>
        </div>

        <label className="filter-row" htmlFor="month-filter">
          <span>Filter by month</span>
          <select
            id="month-filter"
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

        <div className="table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.type}</td>
                  <td>${item.amount.toLocaleString()}</td>
                  <td>{item.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
