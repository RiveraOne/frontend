import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "./navbar";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#081317" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Metra Wealth — AI Financial Companion",
    template: "%s · Metra Wealth",
  },
  description:
    "Track spending, protect your balance, and make smarter decisions before you buy. Metra Wealth is your AI-powered financial planning companion.",
  keywords: [
    "personal finance",
    "budget tracker",
    "AI financial advisor",
    "expense tracking",
    "money management",
    "financial planning",
  ],
  authors: [{ name: "Metra Wealth" }],
  creator: "Metra Wealth",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Metra Wealth",
    title: "Metra Wealth — AI Financial Companion",
    description:
      "Track spending, protect your balance, and make smarter decisions before you buy.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Metra Wealth — AI Financial Companion",
    description:
      "Track spending, protect your balance, and make smarter decisions before you buy.",
  },
};

const FOOTER_LINKS = {
  Product: [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/advisor", label: "AI Advisor" },
  ],
  App: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/ledger", label: "Ledger" },
    { href: "/ledger/new", label: "Add Transaction" },
  ],
  Account: [
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
    { href: "/settings", label: "Settings" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" suppressHydrationWarning className={dmSans.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var m=t||(d?'dark':'light');document.documentElement.classList.toggle('dark',m==='dark');document.documentElement.style.colorScheme=m;}catch(e){}})();",
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-mw-bg font-[family-name:var(--font-dm-sans)] antialiased">
        <Navbar />

        <div className="flex-1">{children}</div>

        {/* FOOTER */}
        <footer className="mt-auto border-t border-mw-border">

          {/* CTA strip */}
          <div className="bg-gradient-to-r from-mw-soft via-white to-mw-soft dark:from-mw-surface dark:via-mw-surface dark:to-mw-surface">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
              <div>
                <p className="text-base font-black tracking-tight text-mw-primary">
                  Take control of your finances today.
                </p>
                <p className="mt-0.5 text-sm text-mw-body">
                  Start free — no credit card required.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/login" className="mw-btn-ghost">
                  Sign in
                </Link>
                <Link href="/register" className="mw-btn-primary">
                  Get started free →
                </Link>
              </div>
            </div>
          </div>

          {/* Main link grid */}
          <div className="bg-mw-surface">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 sm:grid-cols-[1.6fr_repeat(4,1fr)]">

              {/* Brand column */}
              <div>
                <Link href="/" className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-gradient-to-br from-mw-accent to-mw-primary shadow-[0_0_0_4px_rgba(56,198,179,0.15)]" />
                  <span className="text-sm font-extrabold tracking-tight text-mw-primary">
                    Metra Wealth
                  </span>
                </Link>
                <p className="mt-3 max-w-[22ch] text-sm leading-relaxed text-mw-body">
                  Better decisions before you spend. Build healthy financial
                  habits with confidence.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-mw-border bg-mw-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-mw-light">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mw-accent" />
                  Beta
                </span>
              </div>

              {/* Link columns */}
              {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                <div key={group}>
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-mw-primary">
                    {group}
                  </h4>
                  <ul className="space-y-2.5">
                    {links.map(({ href, label }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="text-sm text-mw-body transition-colors hover:text-mw-primary"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-mw-border">
              <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
                <p className="text-xs text-mw-light">
                  © {year} Metra Wealth. All rights reserved.
                </p>
                <p className="text-xs text-mw-light">
                  Planning support only — not financial advice.
                </p>
              </div>
            </div>
          </div>

        </footer>
      </body>
    </html>
  );
}
