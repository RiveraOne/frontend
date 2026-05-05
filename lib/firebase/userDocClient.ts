"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { UserDoc } from "@/types/user";

export function subscribeToUserDoc(
  uid: string,
  callback: (userDoc: UserDoc | null) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = doc(db, "users", uid);
  return onSnapshot(
    ref,
    (snap) => {
      callback(snap.exists() ? (snap.data() as UserDoc) : null);
    },
    onError
  );
}
