import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-gradient-to-br from-[#0b2f38] via-[#0b4f5a] to-[#0d6b78] p-12 text-white relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-mw-accent/20 blur-3xl" />
        <div className="absolute bottom-12 right-0 h-48 w-48 rounded-full bg-mw-accent/10 blur-2xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-10">
            <span className="h-3 w-3 rounded-full bg-mw-accent shadow-[0_0_0_4px_rgba(56,198,179,0.25)]" />
            <span className="text-base font-extrabold tracking-tight">Metra Wealth</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-snug mb-4">
            Take control of your money, one week at a time.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Track spending, protect your balance, and make smarter decisions before you buy.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: "✓", label: "Live balance visibility" },
            { icon: "✓", label: "Pre-spend decision support" },
            { icon: "✓", label: "Simple budget system" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mw-accent/20 text-xs font-bold text-mw-accent">
                {item.icon}
              </span>
              <span className="text-sm text-white/75">{item.label}</span>
            </div>
          ))}
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
              <p className="mw-section-label mb-1">Welcome back</p>
              <h1 className="mw-title text-2xl">Sign in to your account</h1>
              <p className="mt-1.5 text-sm text-mw-body">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-mw-primary hover:underline">
                  Create one free
                </Link>
              </p>
            </div>

            <form className="grid gap-4" action="/dashboard">
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
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="mw-label">Password</label>
                  <a href="#" className="text-xs font-semibold text-mw-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="mw-input"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="mw-btn-primary mt-1 h-11 w-full text-base">
                Sign in
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-mw-border" />
              <span className="text-xs text-mw-body">Or continue with</span>
              <div className="h-px flex-1 bg-mw-border" />
            </div>

            <button type="button" className="mw-btn-ghost mt-4 h-11 w-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-mw-primary">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-mw-body">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="hover:text-mw-primary">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-mw-primary">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
