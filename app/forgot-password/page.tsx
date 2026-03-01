import Link from "next/link";

export default function ForgotPasswordPage() {
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
        <div className="pointer-events-none absolute top-1/2 left-1/3 h-36 w-36 rounded-full bg-mw-light/10 blur-3xl animate-glow-pulse" />

        {/* Top: logo + headline */}
        <div className="relative z-10">
          <div className="mb-10 inline-flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-mw-accent shadow-[0_0_0_5px_rgba(56,198,179,0.2)]" />
            <span className="text-base font-extrabold tracking-tight">Metra Wealth</span>
          </div>
          <h2 className="mb-4 text-3xl font-black leading-snug tracking-tight">
            We&apos;ll get you back{" "}
            <span className="text-mw-accent">in no time.</span>
          </h2>
          <p className="text-sm leading-relaxed text-white/55">
            Enter your email and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>

        {/* Bottom: steps */}
        <div className="relative z-10 space-y-4">
          {[
            { num: "01", label: "Enter your email address" },
            { num: "02", label: "Check your inbox for the reset link" },
            { num: "03", label: "Create a new password and sign in" },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mw-light/40 to-mw-accent/30 text-xs font-black text-mw-accent">
                {step.num}
              </span>
              <span className="text-sm text-white/75">{step.label}</span>
            </div>
          ))}
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
              {/* Back link */}
              <Link
                href="/login"
                className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-mw-body transition-colors hover:text-mw-primary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to sign in
              </Link>

              <div className="mb-7">
                <p className="mw-section-label mb-1">Password reset</p>
                <h1 className="text-2xl font-black tracking-tight text-mw-primary">
                  Forgot your password?
                </h1>
                <p className="mt-1.5 text-sm text-mw-body">
                  No problem. Enter your email and we&apos;ll send a reset link.
                </p>
              </div>

              <form className="grid gap-4" action="/login">
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
                    />
                  </div>
                </div>

                <button type="submit" className="mw-btn-primary mt-1 h-12 w-full text-base">
                  Send reset link →
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-mw-body">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-mw-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-mw-body">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="hover:text-mw-primary hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
