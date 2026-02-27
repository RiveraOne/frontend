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
    <main className="app-shell">
      <section className="app-section narrow">
        <h1>Add Transaction</h1>
        <p className="app-muted">Temporary local state only. No backend storage yet.</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label htmlFor="type">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as LedgerEntry["type"])}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />

          <label htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Groceries"
          />

          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <label htmlFor="image">Receipt image (optional)</label>
          <input id="image" type="file" accept="image/*" onChange={onFileChange} />

          {previewUrl ? <img src={previewUrl} alt="Receipt preview" className="preview-image" /> : null}

          <button type="submit" className="btn btn-primary" disabled={!canSave}>
            Save
          </button>
        </form>

        {savedItems.length > 0 ? (
          <div className="saved-block">
            <h3>Temporary saved items</h3>
            <ul>
              {savedItems.map((item) => (
                <li key={item.id}>
                  {item.date} - {item.type} - ${item.amount.toLocaleString()} - {item.category}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
