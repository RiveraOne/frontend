"use client";

import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTransaction,
  deleteTransaction,
  subscribeToTransactions,
  type Transaction,
} from "@/lib/firebase";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch the specific transaction
  useEffect(() => {
    if (!user) return;
    getTransaction(user.uid, id).then((tx) => {
      if (!tx) {
        setNotFoundFlag(true);
      } else {
        setTransaction(tx);
      }
      setLoading(false);
    });
  }, [user, id]);

  // Subscribe to all transactions for context stats
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTransactions(user.uid, setAllTransactions);
    return unsub;
  }, [user]);

  async function handleDelete() {
    if (!user || !transaction) return;
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    setDeleting(true);
    await deleteTransaction(user.uid, transaction.id);
    router.push("/ledger");
  }

  if (!authLoading && notFoundFlag) notFound();

  if (authLoading || loading) {
    return (
      <main>
        <section className="mw-shell">
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <div className="h-5 w-24 animate-pulse rounded-lg bg-mw-border" />
            <div className="mw-card h-52 animate-pulse bg-mw-soft" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="mw-card h-28 animate-pulse bg-mw-soft" />
              <div className="mw-card h-28 animate-pulse bg-mw-soft" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!transaction) return null;

  const isIncome = transaction.type === "Income";
  const month = transaction.date.slice(0, 7);

  const related = allTransactions.filter(
    (t) => t.category === transaction.category && t.id !== transaction.id
  );

  const categoryTotal = allTransactions
    .filter((t) => t.category === transaction.category)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyTypeTotal = allTransactions
    .filter((t) => t.date.startsWith(month) && t.type === transaction.type)
    .reduce((sum, t) => sum + t.amount, 0);

  const shareOfMonth =
    monthlyTypeTotal > 0
      ? Math.round((transaction.amount / monthlyTypeTotal) * 100)
      : 0;

  const categoryCount = allTransactions.filter(
    (t) => t.category === transaction.category
  ).length;

  return (
    <ProtectedRoute>
    <main>
      <section className="mw-shell">
        <div className="mx-auto w-full max-w-2xl">
          {/* Back link */}
          <Link
            href="/ledger"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mw-light hover:text-mw-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Ledger
          </Link>

          {/* Main card */}
          <div className="mw-card overflow-hidden">
            <div className={`border-b border-mw-border px-6 py-6 ${
              isIncome
                ? "bg-gradient-to-r from-teal-50 to-white dark:from-teal-950/20 dark:to-mw-surface"
                : "bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/20 dark:to-mw-surface"
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className={isIncome ? "mw-badge-income" : "mw-badge-expense"}>
                    {isIncome ? "↑" : "↓"} {transaction.type}
                  </span>
                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-mw-primary">
                    {transaction.category}
                  </h1>
                  <p className="mt-1 text-sm text-mw-body">{formatDate(transaction.date)}</p>
                </div>
                <p className={`text-4xl font-black tracking-tight ${
                  isIncome ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {isIncome ? "+" : "-"}${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="divide-y divide-mw-border">
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Transaction ID</p>
                <p className="font-mono text-sm text-mw-body">{transaction.id}</p>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Date</p>
                <p className="text-sm font-semibold text-mw-dark">{transaction.date}</p>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Category</p>
                <p className="text-sm font-semibold text-mw-dark">{transaction.category}</p>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Type</p>
                <span className={isIncome ? "mw-badge-income" : "mw-badge-expense"}>
                  {isIncome ? "↑" : "↓"} {transaction.type}
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Amount</p>
                <p className={`text-sm font-bold ${isIncome ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {isIncome ? "+" : "-"}${transaction.amount.toLocaleString()}
                </p>
              </div>

              {transaction.notes && (
                <div className="px-6 py-4">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-mw-light">Notes</p>
                  <p className="text-sm text-mw-dark">{transaction.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Context stats */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="mw-card p-5">
              <p className="mw-section-label mb-1">Category total</p>
              <p className="text-2xl font-black text-mw-primary">${categoryTotal.toLocaleString()}</p>
              <p className="mt-1 text-xs text-mw-body">
                Across {categoryCount} {categoryCount === 1 ? "transaction" : "transactions"} in{" "}
                <span className="font-semibold">{transaction.category}</span>
              </p>
            </div>

            <div className="mw-card p-5">
              <p className="mw-section-label mb-1">Share of {formatMonth(transaction.date)}</p>
              <p className="text-2xl font-black text-mw-primary">{shareOfMonth}%</p>
              <p className="mt-1 text-xs text-mw-body">
                Of total {transaction.type.toLowerCase()} (${monthlyTypeTotal.toLocaleString()}) this month
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mw-border">
                <div
                  className={`h-full rounded-full ${isIncome ? "bg-teal-400" : "bg-rose-400"}`}
                  style={{ width: `${Math.min(shareOfMonth, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Related transactions */}
          {related.length > 0 && (
            <div className="mt-4">
              <p className="mw-section-label mb-3">Other {transaction.category} transactions</p>
              <div className="mw-card divide-y divide-mw-border overflow-hidden">
                {related.slice(0, 5).map((t) => (
                  <Link
                    key={t.id}
                    href={`/ledger/${t.id}`}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-mw-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
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
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${t.type === "Income" ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {t.type === "Income" ? "+" : "-"}${t.amount.toLocaleString()}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-mw-light">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/ledger/new" className="mw-btn-ghost gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add similar
            </Link>
            <Link href="/ledger" className="mw-btn-ghost">
              View all transactions
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="mw-btn-ghost ml-auto gap-2 text-rose-600 hover:border-rose-300 hover:bg-rose-50 disabled:opacity-60 dark:hover:bg-rose-950/30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </section>
    </main>
    </ProtectedRoute>
  );
}
