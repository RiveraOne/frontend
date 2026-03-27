"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail, loginWithGoogle } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerWithEmail(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)]">

      {/* ── Left decorative panel ─────────────────── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[42%] flex-col justify-between bg-gradient-to-br from-[#071e24] via-[#0b3a45] to-[#0d5f6e] p-12 text-white">
        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Animated orbs */}
        <div className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-mw-accent/15 blur-3xl animate-float" />
        <div className="pointer-events-none absolute bottom-0 -left-12 h-56 w-56 rounded-full bg-mw-accent/10 blur-2xl animate-float-slow" />
        <div className="pointer-events-none absolute top-1/3 right-1/4 h-32 w-32 rounded-full bg-mw-light/15 blur-2xl animate-glow-pulse" />

        {/* Top section: logo + headline */}
        <div className="relative z-10">
          <div className="mb-10 inline-flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-mw-accent shadow-[0_0_0_5px_rgba(56,198,179,0.2)]" />
            <span className="text-base font-extrabold tracking-tight">Metra Wealth</span>
          </div>
          <h2 className="mb-4 text-3xl font-black leading-snug tracking-tight">
            Start your financial system{" "}
            <span className="text-mw-accent">in under 2 minutes.</span>
          </h2>
          <p className="text-sm leading-relaxed text-white/55">
            No bank connection needed. Start tracking manually and build your financial foundation today.
          </p>
        </div>

        {/* Bottom section: what you get card */}
        <div className="relative z-10 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="mw-section-label mb-4 text-mw-accent">What you get free</p>
            <div className="space-y-3">
              {[
                { label: "Full ledger tracking", detail: "Log income and expenses instantly" },
                { label: "Live balance overview", detail: "See your true position at a glance" },
                { label: "AI advisor (5 queries/day)", detail: "Get smart money guidance" },
                { label: "Receipt image upload", detail: "Store proof of purchase securely" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-mw-accent/20 text-[10px] font-bold text-mw-accent">
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/90">{item.label}</p>
                    <p className="text-xs text-white/45">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-white/35">
            No credit card required · Free forever plan available
          </p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-mw-soft to-mw-bg px-5 py-12 sm:px-10">
        {/* Faint bg orb */}
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-mw-accent/5 blur-3xl" />

        <div className="relative w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-mw-accent shadow-[0_0_0_4px_rgba(56,198,179,0.2)]" />
            <span className="text-base font-extrabold tracking-tight text-mw-primary">Metra Wealth</span>
          </div>

          {/* Mobile free plan nudge */}
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-mw-accent/20 bg-mw-accent/8 px-4 py-2.5 lg:hidden">
            <span className="text-sm text-mw-accent">✓</span>
            <p className="text-xs font-medium text-mw-primary">
              Free forever plan · No credit card required
            </p>
          </div>

          <div className="mw-card overflow-hidden shadow-xl shadow-mw-primary/5">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-mw-light to-mw-accent" />

            <div className="p-8">
              <div className="mb-7">
                <p className="mw-section-label mb-1">Get started free</p>
                <h1 className="text-2xl font-black tracking-tight text-mw-primary">
                  Create your account
                </h1>
                <p className="mt-1.5 text-sm text-mw-body">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-mw-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <form className="grid gap-4" onSubmit={handleSubmit}>
                {/* Full name */}
                <div>
                  <label htmlFor="name" className="mw-label mb-1.5 block">
                    Full name
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-mw-body/60">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                      </svg>
                    </span>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      className="mw-input pl-9"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mw-label mb-1.5 block">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-mw-body/60">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="mw-input pl-9"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mw-label mb-1.5 block">
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-mw-body/60">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      className="mw-input pl-9"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-mw-body">At least 8 characters recommended.</p>
                </div>

                <button
                  type="submit"
                  className="mw-btn-primary mt-1 h-12 w-full text-base disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Creating account…" : "Create free account →"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-mw-border" />
                <span className="text-xs text-mw-body">Or sign up with</span>
                <div className="h-px flex-1 bg-mw-border" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="mw-btn-ghost h-11 w-full gap-3 border-mw-border/80 hover:border-mw-light/50 disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-mw-body">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="hover:text-mw-primary hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-mw-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    switch ((err as { code: string }).code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
