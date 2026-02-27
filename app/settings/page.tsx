import Link from "next/link";
import { mockUser } from "@/lib/mock-data";

export default function SettingsPage() {
  const initials = mockUser.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isPro = mockUser.subscription?.toLowerCase().includes("pro");

  return (
    <main>
      <section className="mw-shell">
        <div className="mx-auto w-full max-w-2xl">
          {/* Page header */}
          <div className="mw-page-header">
            <div>
              <p className="mw-section-label mb-0.5">Account</p>
              <h1 className="mw-title">Settings</h1>
              <p className="mt-1 text-sm text-mw-body">Manage your profile and preferences.</p>
            </div>
          </div>

          {/* Profile card */}
          <div className="mw-card overflow-hidden">
            {/* Profile header */}
            <div className="flex items-center gap-4 border-b border-mw-border bg-gradient-to-r from-mw-soft to-white px-6 py-5 dark:to-mw-surface">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mw-accent to-mw-primary text-xl font-black text-white shadow-md">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-black text-mw-primary">{mockUser.name}</p>
                  {isPro ? (
                    <span className="mw-badge-pro">Pro</span>
                  ) : (
                    <span className="mw-badge border border-mw-border bg-mw-soft text-mw-light">Free</span>
                  )}
                </div>
                <p className="text-sm text-mw-body">{mockUser.email}</p>
              </div>
            </div>

            {/* Profile details */}
            <div className="divide-y divide-mw-border">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Full Name</p>
                  <p className="mt-0.5 text-sm font-semibold text-mw-dark">{mockUser.name}</p>
                </div>
                <button type="button" className="mw-btn-ghost py-1.5 text-xs">Edit</button>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Email Address</p>
                  <p className="mt-0.5 text-sm font-semibold text-mw-dark">{mockUser.email}</p>
                </div>
                <button type="button" className="mw-btn-ghost py-1.5 text-xs">Edit</button>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Password</p>
                  <p className="mt-0.5 text-sm text-mw-body">••••••••••</p>
                </div>
                <button type="button" className="mw-btn-ghost py-1.5 text-xs">Change</button>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Subscription</p>
                  <p className="mt-0.5 text-sm font-semibold text-mw-dark">{mockUser.subscription || "Free Plan"}</p>
                </div>
                {!isPro && (
                  <Link href="/pricing" className="mw-btn-primary py-1.5 text-xs">
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sign out */}
          <div className="mt-5 mw-card overflow-hidden">
            <div className="border-b border-mw-border px-6 py-4">
              <p className="text-sm font-bold text-mw-primary">Session</p>
            </div>
            <div className="px-6 py-4">
              <p className="mb-3 text-sm text-mw-body">
                Signing out will end your current session. Your data will remain saved.
              </p>
              <Link href="/" className="mw-btn-danger">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </Link>
            </div>
          </div>

          {/* Plan upgrade prompt */}
          {!isPro && (
            <div className="mt-5 rounded-2xl border border-mw-accent/30 bg-gradient-to-r from-teal-50 to-white p-5 dark:from-teal-950/20 dark:to-mw-surface">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-mw-primary">Unlock Pro features</p>
                  <p className="mt-0.5 text-xs text-mw-body">
                    Unlimited AI queries, advanced insights, and smart budget rules.
                  </p>
                </div>
                <Link href="/pricing" className="mw-btn-primary text-sm">
                  View Plans →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
