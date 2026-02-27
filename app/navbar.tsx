"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./theme-toggle";

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

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

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
          <Link href="/login" className="mw-btn-ghost hidden sm:inline-flex">
            Login
          </Link>
          <Link href="/register" className="mw-btn-primary hidden sm:inline-flex">
            Get Started
          </Link>

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

          {/* Mobile auth buttons */}
          <div className="mt-4 flex flex-col gap-2 border-t border-mw-border pt-4">
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
          </div>
        </div>
      )}
    </header>
  );
}
