"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(email, password);
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
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-mw-accent/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-56 w-56 rounded-full bg-mw-accent/10 blur-2xl animate-float" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mw-light/10 blur-3xl animate-glow-pulse" />

        {/* Top section: logo + headline */}
        <div className="relative z-10">
          <div className="mb-10 inline-flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-mw-accent shadow-[0_0_0_5px_rgba(56,198,179,0.2)]" />
            <span className="text-base font-extrabold tracking-tight">Metra Wealth</span>
          </div>
          <h2 className="mb-4 text-3xl font-black leading-snug tracking-tight">
            Take control of your money,{" "}
            <span className="text-mw-accent">one week at a time.</span>
          </h2>
          <p className="text-sm leading-relaxed text-white/55">
            Track spending, protect your balance, and make smarter decisions before you buy.
          </p>
        </div>

        {/* Bottom section: feature list + trust stat */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            {[
              { label: "Live balance visibility" },
              { label: "Pre-spend decision support" },
              { label: "Simple budget system" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-mw-accent/20 text-xs font-bold text-mw-accent">
                  ✓
                </span>
                <span className="text-sm text-white/75">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Trust stat */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {["bg-mw-accent", "bg-teal-400", "bg-mw-light", "bg-teal-300"].map((c, i) => (
                <div key={i} className={`h-7 w-7 rounded-full ${c} border-2 border-[#0b3a45]`} />
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-white">2,000+ users</p>
              <p className="text-xs text-white/50">Building better money habits</p>
            </div>
          </div>
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

          <div className="mw-card overflow-hidden shadow-xl shadow-mw-primary/5">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-mw-light to-mw-accent" />

            <div className="p-8">
              <div className="mb-7">
                <p className="mw-section-label mb-1">Welcome back</p>
                <h1 className="text-2xl font-black tracking-tight text-mw-primary">
                  Sign in to your account
                </h1>
                <p className="mt-1.5 text-sm text-mw-body">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-semibold text-mw-primary hover:underline">
                    Create one free
                  </Link>
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <form className="grid gap-4" onSubmit={handleSubmit}>
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
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="mw-label">Password</label>
                    <Link href="/forgot-password" className="text-xs font-semibold text-mw-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-mw-body/60">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="mw-input pl-9"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mw-btn-primary mt-1 h-12 w-full text-base disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in →"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-mw-border" />
                <span className="text-xs text-mw-body">Or continue with</span>
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
            By signing in, you agree to our{" "}
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
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
