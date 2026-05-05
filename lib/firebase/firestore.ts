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
  return { id: snap.id, ...snap.data() } as Transaction;
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
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction))
      );
    },
    onError
  );
}
