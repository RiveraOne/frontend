"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase";

const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
  { href: "/pricing", label: "Pricing", exact: false },
  { href: "/dashboard", label: "Dashboard", exact: false },
  { href: "/advisor", label: "Advisor", exact: false },
];

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Avatar({ name, photoURL }: { name: string | null; photoURL: string | null }) {
  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={name ?? "User"}
        className="h-8 w-8 rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-mw-accent to-mw-primary text-xs font-black text-white">
      {initials}
    </span>
  );
}

function UserMenu({ name, email, photoURL }: { name: string | null; email: string | null; photoURL: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.push("/");
  }

  const firstName = name?.split(" ")[0] ?? email?.split("@")[0] ?? "Account";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-mw-border bg-mw-soft px-2.5 py-1.5 text-sm font-semibold text-mw-primary transition-colors hover:border-mw-light/50 hover:bg-mw-surface"
      >
        <Avatar name={name} photoURL={photoURL} />
        <span className="hidden sm:block">{firstName}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-mw-border bg-mw-bg shadow-xl shadow-mw-primary/10">
          {/* User info */}
          <div className="flex items-center gap-3 border-b border-mw-border px-4 py-3">
            <Avatar name={name} photoURL={photoURL} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-mw-primary">{name ?? "User"}</p>
              <p className="truncate text-xs text-mw-body">{email}</p>
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/ledger", label: "Ledger" },
              { href: "/settings", label: "Settings" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-mw-body transition-colors hover:bg-mw-soft hover:text-mw-primary"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Sign out */}
          <div className="border-t border-mw-border py-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleMobileLogout() {
    setMobileOpen(false);
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-mw-border/70 bg-mw-bg/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="mr-4 inline-flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-mw-accent to-mw-primary shadow-[0_0_0_4px_rgba(56,198,179,0.18)]" />
            <span className="text-base font-extrabold tracking-tight text-mw-primary">Metra Wealth</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center sm:flex" aria-label="Primary">
            {NAV_LINKS.map(({ href, label, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "text-mw-primary"
                      : "text-mw-light hover:bg-mw-soft hover:text-mw-primary"
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-mw-accent" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Auth area — skeleton while resolving */}
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-xl bg-mw-border" />
          ) : user ? (
            <UserMenu
              name={user.displayName}
              email={user.email}
              photoURL={user.photoURL}
            />
          ) : (
            <>
              <Link href="/login" className="mw-btn-ghost hidden sm:inline-flex">
                Login
              </Link>
              <Link href="/register" className="mw-btn-primary hidden sm:inline-flex">
                Get Started
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="mw-btn-ghost h-9 w-9 p-0 sm:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-mw-border bg-mw-bg px-5 pb-4 sm:hidden">
          <nav className="mt-3 flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map(({ href, label, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-mw-soft text-mw-primary"
                      : "text-mw-light hover:bg-mw-soft hover:text-mw-primary"
                  }`}
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-mw-accent" />
                  )}
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile auth */}
          <div className="mt-4 flex flex-col gap-2 border-t border-mw-border pt-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-1 pb-2">
                  <Avatar name={user.displayName} photoURL={user.photoURL} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-mw-primary">{user.displayName ?? "User"}</p>
                    <p className="truncate text-xs text-mw-body">{user.email}</p>
                  </div>
                </div>
                <Link href="/settings" onClick={() => setMobileOpen(false)} className="mw-btn-ghost w-full">
                  Settings
                </Link>
                <button type="button" onClick={handleMobileLogout} className="mw-btn-ghost w-full text-rose-600 hover:border-rose-300">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mw-btn-ghost w-full"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="mw-btn-primary w-full"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
