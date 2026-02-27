import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "./theme-toggle";

export const metadata: Metadata = {
  title: "Metra Wealth",
  description: "AI financial companion"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var m=t||(d?'dark':'light');document.documentElement.classList.toggle('dark',m==='dark');document.documentElement.style.colorScheme=m;}catch(e){}})();"
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-mw-bg">
        <header className="sticky top-0 z-20 border-b border-mw-border/70 bg-mw-bg/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gradient-to-br from-mw-accent to-mw-primary shadow-[0_0_0_4px_rgba(56,198,179,0.18)]" />
                <span className="text-base font-extrabold tracking-tight text-mw-primary">Metra Wealth</span>
              </Link>
              <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
                <Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-mw-light hover:bg-white/5 hover:text-mw-primary">
                  Home
                </Link>
                <Link href="/pricing" className="rounded-lg px-3 py-2 text-sm font-semibold text-mw-light hover:bg-white/5 hover:text-mw-primary">
                  Pricing
                </Link>
                <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-semibold text-mw-light hover:bg-white/5 hover:text-mw-primary">
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login" className="mw-btn-ghost">
                Login
              </Link>
              <Link href="/register" className="mw-btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="mt-auto border-t border-mw-border bg-gradient-to-b from-mw-surface to-mw-soft">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 md:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gradient-to-br from-mw-accent to-mw-primary" />
                <span className="text-base font-extrabold tracking-tight text-mw-primary">Metra Wealth</span>
              </div>
              <p className="mt-3 max-w-md text-sm text-mw-body">
                Better decisions before you spend. Build healthy financial systems with confidence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Product</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/" className="block text-mw-light hover:text-mw-primary">Home</Link>
                  <Link href="/pricing" className="block text-mw-light hover:text-mw-primary">Pricing</Link>
                  <Link href="/advisor" className="block text-mw-light hover:text-mw-primary">Advisor</Link>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Account</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/login" className="block text-mw-light hover:text-mw-primary">Login</Link>
                  <Link href="/register" className="block text-mw-light hover:text-mw-primary">Register</Link>
                  <Link href="/settings" className="block text-mw-light hover:text-mw-primary">Settings</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-mw-border px-5 py-4 text-xs text-mw-light">
            <span>© {year} Metra Wealth</span>
            <span className="inline-flex items-center gap-3">
              <Link href="/privacy" className="hover:text-mw-primary">Privacy</Link>
              <Link href="/terms" className="hover:text-mw-primary">Terms</Link>
            </span>
            <span>Not financial advice</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
