"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import type { LedgerEntry } from "@/lib/mock-data";

export default function NewLedgerEntryPage() {
  const [type, setType] = useState<LedgerEntry["type"]>("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [savedItems, setSavedItems] = useState<LedgerEntry[]>([]);

  const canSave = useMemo(() => {
    return Boolean(amount && category.trim() && date);
  }, [amount, category, date]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewUrl("");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    const newItem: LedgerEntry = {
      id: crypto.randomUUID(),
      type,
      amount: Number(amount),
      category: category.trim(),
      date,
    };

    setSavedItems((prev) => [newItem, ...prev]);
    setAmount("");
    setCategory("");
    setDate("");
    setPreviewUrl("");
  };

  return (
    <main>
      <section className="mw-shell">
        <div className="mx-auto w-full max-w-2xl">
          {/* Back link */}
          <Link href="/ledger" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mw-light hover:text-mw-primary transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Ledger
          </Link>

          {/* Form card */}
          <div className="mw-card overflow-hidden">
            {/* Card header */}
            <div className="border-b border-mw-border px-6 py-5">
              <p className="mw-section-label mb-0.5">New Entry</p>
              <h1 className="mw-title text-2xl">Add Transaction</h1>
              <p className="mt-1 text-sm text-mw-body">Fill in the details below to log a new transaction.</p>
            </div>

            {/* Form body */}
            <form onSubmit={onSubmit} className="p-6">
              {/* Type toggle */}
              <div className="mb-5">
                <p className="mw-label mb-2">Transaction type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["Expense", "Income"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold transition-all ${
                        type === t
                          ? t === "Income"
                            ? "border-teal-400 bg-teal-50 text-teal-700 shadow-sm dark:border-teal-600 dark:bg-teal-950/50 dark:text-teal-300"
                            : "border-rose-400 bg-rose-50 text-rose-700 shadow-sm dark:border-rose-600 dark:bg-rose-950/50 dark:text-rose-300"
                          : "border-mw-border bg-mw-soft text-mw-body hover:border-mw-light"
                      }`}
                    >
                      <span>{t === "Income" ? "↑" : "↓"}</span>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="mw-label mb-1.5 block">Amount</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-mw-light">$</span>
                    <input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="mw-input pl-7"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="mw-label mb-1.5 block">Date</label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mw-input"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mt-4">
                <label htmlFor="category" className="mw-label mb-1.5 block">Category</label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Groceries, Rent, Salary"
                  className="mw-input"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(type === "Expense"
                    ? ["Groceries", "Rent", "Transport", "Utilities", "Dining"]
                    : ["Salary", "Freelance", "Investment", "Gift"]
                  ).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCategory(tag)}
                      className="rounded-full border border-mw-border bg-mw-soft px-2.5 py-0.5 text-xs font-semibold text-mw-light hover:border-mw-accent hover:text-mw-primary transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Receipt */}
              <div className="mt-4">
                <label htmlFor="image" className="mw-label mb-1.5 block">
                  Receipt image <span className="font-normal text-mw-body">(optional)</span>
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-mw-border bg-mw-soft px-4 py-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="flex-shrink-0 text-mw-light">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="flex-1 text-xs text-mw-body file:mr-3 file:rounded-lg file:border-0 file:bg-mw-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:opacity-90"
                  />
                </div>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="mt-3 max-h-48 w-full rounded-xl border border-mw-border object-cover"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={!canSave}
                className="mw-btn-primary mt-6 h-11 w-full text-base disabled:cursor-not-allowed disabled:opacity-40"
              >
                {canSave ? "Save Transaction" : "Fill in all fields to save"}
              </button>
            </form>
          </div>

          {/* Saved items */}
          {savedItems.length > 0 && (
            <div className="mt-5 mw-card overflow-hidden">
              <div className="border-b border-mw-border px-5 py-4">
                <p className="text-sm font-bold text-mw-primary">
                  Session entries ({savedItems.length})
                </p>
                <p className="text-xs text-mw-body mt-0.5">Saved locally — not persisted yet.</p>
              </div>
              <div className="divide-y divide-mw-border">
                {savedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={item.type === "Income" ? "mw-badge-income" : "mw-badge-expense"}>
                        {item.type === "Income" ? "↑" : "↓"} {item.type}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-mw-dark">{item.category}</p>
                        <p className="text-xs text-mw-body">{item.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${item.type === "Income" ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {item.type === "Income" ? "+" : "-"}${item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
