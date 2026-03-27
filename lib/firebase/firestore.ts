import { getFirestore } from "firebase/firestore";
import app from "./config";

// ─── Firestore ────────────────────────────────────────────────────────────────
// TODO: Add collections, queries, and helpers here as features are built out.
// e.g. ledger entries, user profiles, subscription status, etc.

export const db = getFirestore(app);
