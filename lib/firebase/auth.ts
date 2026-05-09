import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

async function provision(credential: UserCredential): Promise<void> {
  try {
    const token = await credential.user.getIdToken();
    await fetch("/api/auth/provision", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Provision failure is non-fatal; server routes also backfill before paid flows.
  }
}

// ─── Email / password ─────────────────────────────────────────────────────────

export async function registerWithEmail(
  name: string,
  email: string,
  password: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await provision(credential);
  return credential;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await provision(credential);
  return credential;
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function loginWithGoogle(): Promise<UserCredential> {
  const credential = await signInWithPopup(auth, googleProvider);
  await provision(credential);
  return credential;
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  return signOut(auth);
}
