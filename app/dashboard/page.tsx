"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import {
  friendlyFirestoreError,
  subscribeToTransactions,
  type Transaction,
} from "@/lib/firebase";

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TrendDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function QuickLink({ href, label, description, icon }: { href: string; label: string; description: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mw-card flex items-start gap-3 p-4 transition-all hover:shadow-md hover:border-mw-light"
    >
      <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-mw-soft text-mw-primary">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-mw-primary">{label}</p>
        <p className="text-xs text-mw-body mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState("");

  useEffect(() => {
    if (!user) return;
    setTxLoading(true);
    setTxError("");
    const unsub = subscribeToTransactions(
      user.uid,
      (data) => {
        setTransactions(data);
        setTxLoading(false);
      },
      (error) => {
        console.error("Dashboard subscription error:", error);
        setTxError(friendlyFirestoreError(error));
        setTxLoading(false);
      }
    );
    return unsub;
  }, [user]);

  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = totalIncome - totalExpenses;
  const spendRatio = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <ProtectedRoute>
    <main>
      <section className="mw-shell">
        {/* Page header */}
        <div className="mw-page-header">
          <div>
            <p className="mw-section-label mb-0.5">Overview</p>
            <h1 className="mw-title">Good to see you, {firstName}.</h1>
            <p className="mt-1 text-sm text-mw-body">Here&apos;s your financial snapshot.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/ledger/new" className="mw-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add Transaction
            </Link>
            <Link href="/advisor" className="mw-btn-ghost">Ask AI</Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Income */}
          <article className="mw-stat-card border-l-4 border-l-teal-400">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                <TrendUpIcon />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                <ArrowUpIcon />
                Income
              </span>
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight text-mw-primary">
              {txLoading ? <span className="inline-block h-9 w-28 animate-pulse rounded-lg bg-mw-border" /> : `$${totalIncome.toLocaleString()}`}
            </p>
            <p className="text-xs text-mw-body">Total this period</p>
          </article>

          {/* Expenses */}
          <article className="mw-stat-card border-l-4 border-l-rose-400">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <TrendDownIcon />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <ArrowDownIcon />
                Expenses
              </span>
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight text-mw-primary">
              {txLoading ? <span className="inline-block h-9 w-28 animate-pulse rounded-lg bg-mw-border" /> : `$${totalExpenses.toLocaleString()}`}
            </p>
            <p className="text-xs text-mw-body">{spendRatio}% of income spent</p>
          </article>

          {/* Balance */}
          <article className={`mw-stat-card border-l-4 ${remaining >= 0 ? "border-l-mw-accent" : "border-l-rose-400"}`}>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mw-soft text-mw-primary">
                <WalletIcon />
              </div>
              <span className="text-xs font-semibold text-mw-light">Balance</span>
            </div>
            <p className={`mt-3 text-3xl font-black tracking-tight ${remaining >= 0 ? "text-mw-primary" : "text-rose-600"}`}>
              {txLoading ? (
                <span className="inline-block h-9 w-28 animate-pulse rounded-lg bg-mw-border" />
              ) : (
                <>
                  ${Math.abs(remaining).toLocaleString()}
                  {remaining < 0 && <span className="ml-1 text-base">deficit</span>}
                </>
              )}
            </p>
            <p className="text-xs text-mw-body">Remaining after expenses</p>
          </article>
        </div>

        {/* Spend ratio bar */}
        <div className="mt-4 mw-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-mw-primary">Budget utilisation</p>
            <span className={`text-sm font-bold ${spendRatio > 80 ? "text-rose-600" : "text-teal-600"}`}>
              {txLoading ? "..." : `${spendRatio}%`}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-mw-border">
            <div
              className={`h-full rounded-full transition-all ${spendRatio > 80 ? "bg-rose-400" : "bg-gradient-to-r from-mw-accent to-mw-primary"}`}
              style={{ width: txLoading ? "0%" : `${Math.min(spendRatio, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-mw-body">
            <span>$0</span>
            <span>{txLoading ? "Loading income..." : `$${totalIncome.toLocaleString()} total income`}</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6">
          <p className="mw-section-label mb-3">Quick actions</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickLink
              href="/ledger"
              label="View Ledger"
              description="Browse all transactions"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              }
            />
            <QuickLink
              href="/advisor"
              label="AI Advisor"
              description="Ask a money question"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              }
            />
            <QuickLink
              href="/settings"
              label="Settings"
              description="Manage your profile"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              }
            />
          </div>
        </div>

        {/* Recent transactions */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="mw-section-label">Recent transactions</p>
            <Link href="/ledger" className="text-xs font-semibold text-mw-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="mw-card divide-y divide-mw-border overflow-hidden">
            {txError && (
              <div className="px-5 py-8 text-center text-sm font-semibold text-rose-600">
                {txError}
              </div>
            )}
            {!txError && txLoading && (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-mw-border" />
                    <div>
                      <div className="h-4 w-24 animate-pulse rounded bg-mw-border" />
                      <div className="mt-1 h-3 w-16 animate-pulse rounded bg-mw-border" />
                    </div>
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded bg-mw-border" />
                </div>
              ))
            )}
            {!txError && !txLoading && recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-mw-soft transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                    t.type === "Income"
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                  }`}>
                    {t.type === "Income" ? "↑" : "↓"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-mw-dark">{t.category}</p>
                    <p className="text-xs text-mw-body">{t.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${t.type === "Income" ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {t.type === "Income" ? "+" : "-"}${t.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {!txError && !txLoading && recentTransactions.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm font-semibold text-mw-primary">No transactions yet</p>
                <p className="mt-1 text-xs text-mw-body">Add your first transaction to build a snapshot.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
    </ProtectedRoute>
  );
}
