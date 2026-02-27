"use client";

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

    if (!canSave) {
      return;
    }

    const newItem: LedgerEntry = {
      id: crypto.randomUUID(),
      type,
      amount: Number(amount),
      category: category.trim(),
      date
    };

    setSavedItems((prev) => [newItem, ...prev]);
    setAmount("");
    setCategory("");
    setDate("");
  };

  return (
    <main>
      <section className="mw-shell">
        <div className="mw-card mx-auto w-full max-w-3xl p-6">
          <h1 className="mw-title">Add Transaction</h1>
          <p className="mt-1 text-sm text-mw-body">Temporary local state only. No backend storage yet.</p>

          <form onSubmit={onSubmit} className="mt-5 grid gap-2">
            <label htmlFor="type" className="mw-label">Type</label>
            <select
              id="type"
              className="mw-input"
              value={type}
              onChange={(e) => setType(e.target.value as LedgerEntry["type"])}
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>

            <label htmlFor="amount" className="mw-label">Amount</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mw-input"
            />

            <label htmlFor="category" className="mw-label">Category</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Groceries"
              className="mw-input"
            />

            <label htmlFor="date" className="mw-label">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mw-input" />

            <label htmlFor="image" className="mw-label">Receipt image (optional)</label>
            <input id="image" type="file" accept="image/*" onChange={onFileChange} className="mw-input" />

            {previewUrl ? (
              <img src={previewUrl} alt="Receipt preview" className="mt-2 max-h-56 w-full rounded-xl border border-mw-border object-cover" />
            ) : null}

            <button type="submit" className="mw-btn-primary mt-3 w-full disabled:opacity-50" disabled={!canSave}>
              Save
            </button>
          </form>

          {savedItems.length > 0 ? (
            <div className="mt-5 border-t border-mw-border pt-4">
              <h3 className="text-base font-bold text-mw-primary">Temporary saved items</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-mw-body">
                {savedItems.map((item) => (
                  <li key={item.id}>
                    {item.date} - {item.type} - ${item.amount.toLocaleString()} - {item.category}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
