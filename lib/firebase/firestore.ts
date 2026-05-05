import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import app from "./config";

export const db = getFirestore(app);

export function friendlyFirestoreError(error: Error): string {
  if ("code" in error && error.code === "permission-denied") {
    return "Missing Firestore permission. Deploy firestore.rules so signed-in users can read and write their own transactions.";
  }

  return "Could not load transactions. Please check your connection and try again.";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = "Income" | "Expense";

export type Transaction = {
  id: string;
  date: string;          // "YYYY-MM-DD"
  type: TransactionType;
  amount: number;
  category: string;
  notes?: string;
  receiptUrl?: string;   // TODO: populated once Storage upload is wired up
  createdAt: Timestamp;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function txCol(userId: string) {
  return collection(db, "users", userId, "transactions");
}

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

function normalizeTransaction(id: string, data: Record<string, unknown>): Transaction {
  return {
    id,
    date: dateToInputString(data.date),
    type: data.type === "Income" ? "Income" : "Expense",
    amount: typeof data.amount === "number" && Number.isFinite(data.amount) ? data.amount : 0,
    category: typeof data.category === "string" ? data.category : "Uncategorized",
    ...(typeof data.notes === "string" && data.notes ? { notes: data.notes } : {}),
    ...(typeof data.receiptUrl === "string" && data.receiptUrl ? { receiptUrl: data.receiptUrl } : {}),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function addTransaction(
  userId: string,
  data: Omit<Transaction, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(txCol(userId), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getTransaction(
  userId: string,
  id: string
): Promise<Transaction | null> {
  const snap = await getDoc(doc(db, "users", userId, "transactions", id));
  if (!snap.exists()) return null;
  return normalizeTransaction(snap.id, snap.data());
}

export async function deleteTransaction(
  userId: string,
  id: string
): Promise<void> {
  return deleteDoc(doc(db, "users", userId, "transactions", id));
}

// ─── Real-time listener ───────────────────────────────────────────────────────

export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(txCol(userId), orderBy("date", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => normalizeTransaction(d.id, d.data()))
      );
    },
    onError
  );
}
