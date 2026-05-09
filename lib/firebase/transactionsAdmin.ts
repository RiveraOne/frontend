import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { AdvisorTransaction } from "@/lib/ai/types";

function dateToInputString(value: unknown): string {
  if (typeof value === "string") return value;

  if (value instanceof Timestamp) {
    return value.toDate().toISOString().slice(0, 10);
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof value.seconds === "number"
  ) {
    return new Date(value.seconds * 1000).toISOString().slice(0, 10);
  }

  return "";
}

function toAdvisorTransaction(id: string, data: DocumentData): AdvisorTransaction | null {
  const date = dateToInputString(data.date);
  const type = data.type === "Income" || data.type === "Expense" ? data.type : null;
  const amount = typeof data.amount === "number" && Number.isFinite(data.amount) ? data.amount : null;
  const category = typeof data.category === "string" && data.category.trim() ? data.category : null;

  if (!date || !type || amount === null || !category) return null;

  return {
    id,
    date,
    type,
    amount,
    category,
    ...(typeof data.notes === "string" && data.notes ? { notes: data.notes } : {}),
    ...(typeof data.receiptUrl === "string" && data.receiptUrl ? { receiptUrl: data.receiptUrl } : {}),
  };
}

export async function getAdvisorTransactions(uid: string, limit: number): Promise<AdvisorTransaction[]> {
  const snap = await adminDb
    .collection("users")
    .doc(uid)
    .collection("transactions")
    .orderBy("date", "desc")
    .limit(limit)
    .get();

  return snap.docs
    .map((doc) => toAdvisorTransaction(doc.id, doc.data()))
    .filter((transaction): transaction is AdvisorTransaction => transaction !== null);
}
