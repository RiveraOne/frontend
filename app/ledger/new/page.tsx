"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { addTransaction, uploadReceipt, type TransactionType } from "@/lib/firebase";

export default function NewLedgerEntryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [type, setType] = useState<TransactionType>("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parsedAmount = Number(amount);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const canSave = useMemo(
    () => Boolean(hasValidAmount && category.trim() && date),
    [hasValidAmount, category, date]
  );

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setReceiptFile(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : "";
    });
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSave || !user) return;
    setError("");
    setSaving(true);
    try {
      const trimmedNotes = notes.trim();
      const receiptUrl = receiptFile ? await uploadReceipt(user.uid, receiptFile) : "";
      await addTransaction(user.uid, {
        type,
        amount: parsedAmount,
        category: category.trim(),
        date,
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        ...(receiptUrl ? { receiptUrl } : {}),
      });
      router.push("/ledger");
    } catch (err) {
      console.error("addTransaction error:", err);
      const code = (err as { code?: string })?.code;
      if (code === "permission-denied") {
        setError("Permission denied — check your Firestore security rules in the Firebase Console.");
      } else if (code === "unavailable" || code === "failed-precondition") {
        setError("Firestore database not reachable. Make sure it has been created in the Firebase Console.");
      } else if (typeof code === "string" && code.startsWith("storage/")) {
        setError("Could not upload receipt image. Make sure Firebase Storage is enabled and your storage rules allow signed-in uploads.");
      } else {
        setError(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
      }
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
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
            <div className="border-b border-mw-border px-6 py-5">
              <p className="mw-section-label mb-0.5">New Entry</p>
              <h1 className="mw-title text-2xl">Add Transaction</h1>
              <p className="mt-1 text-sm text-mw-body">Fill in the details below to log a new transaction.</p>
            </div>

            <form onSubmit={onSubmit} className="p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-400">
                  {error}
                </div>
              )}

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
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="mw-input pl-7"
                      required
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
                    required
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
                  required
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(type === "Expense"
                    ? ["Groceries", "Rent", "Transport", "Utilities", "Dining", "Shopping"]
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

              {/* Notes */}
              <div className="mt-4">
                <label htmlFor="notes" className="mw-label mb-1.5 block">
                  Notes <span className="font-normal text-mw-body">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any extra details…"
                  className="mw-input resize-none"
                />
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
                  <div className="relative mt-3 h-48 w-full overflow-hidden rounded-xl border border-mw-border">
                    <Image
                      src={previewUrl}
                      alt="Receipt preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSave || saving}
                className="mw-btn-primary mt-6 h-11 w-full text-base disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? "Saving…" : canSave ? "Save Transaction" : "Fill in all fields to save"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
    </ProtectedRoute>
  );
}
