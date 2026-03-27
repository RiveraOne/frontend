import { getStorage } from "firebase/storage";
import app from "./config";

// ─── Firebase Storage ─────────────────────────────────────────────────────────
// TODO: Add upload/download helpers here as features are built out.
// e.g. receipt image uploads, profile photo, etc.

export const storage = getStorage(app);
