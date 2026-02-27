import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-gradient-to-br from-[#0b2f38] via-[#0b4f5a] to-[#0d6b78] p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-mw-accent/15 blur-3xl" />
        <div className="absolute bottom-0 -left-12 h-48 w-48 rounded-full bg-mw-accent/10 blur-2xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-10">
            <span className="h-3 w-3 rounded-full bg-mw-accent shadow-[0_0_0_4px_rgba(56,198,179,0.25)]" />
            <span className="text-base font-extrabold tracking-tight">Metra Wealth</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-snug mb-4">
            Start your financial system in under 2 minutes.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            No bank connection needed. Start tracking manually and build your financial foundation today.
          </p>
        </div>

        <div className="relative z-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="mw-section-label mb-3 text-mw-accent">What you get free</p>
            <div className="space-y-3">
              {[
                "Full ledger tracking",
                "Live balance overview",
                "AI advisor (5 queries/day)",
                "Receipt image upload",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mw-accent/20 text-[10px] font-bold text-mw-accent">
                    ✓
                  </span>
                  <span className="text-sm text-white/75">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-mw-soft px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-mw-accent to-mw-primary" />
            <span className="text-base font-extrabold tracking-tight text-mw-primary">Metra Wealth</span>
          </div>

          <div className="mw-card p-8 shadow-lg">
            <div className="mb-6">
              <p className="mw-section-label mb-1">Get started free</p>
              <h1 className="mw-title text-2xl">Create your account</h1>
              <p className="mt-1.5 text-sm text-mw-body">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-mw-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <form className="grid gap-4" action="/dashboard">
              <div>
                <label htmlFor="name" className="mw-label mb-1.5 block">Full name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="mw-input"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mw-label mb-1.5 block">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mw-input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="mw-label mb-1.5 block">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="mw-input"
                  autoComplete="new-password"
                />
                <p className="mt-1.5 text-xs text-mw-body">At least 8 characters recommended.</p>
              </div>

              <button type="submit" className="mw-btn-primary mt-1 h-11 w-full text-base">
                Create free account
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-mw-border" />
              <span className="text-xs text-mw-body">Or sign up with</span>
              <div className="h-px flex-1 bg-mw-border" />
            </div>

            <button type="button" className="mw-btn-ghost mt-4 h-11 w-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-mw-body">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="hover:text-mw-primary">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-mw-primary">Privacy Policy</Link>.
            No credit card required.
          </p>
        </div>
      </div>
    </main>
  );
}
