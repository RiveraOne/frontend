import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-mw-bg px-5 text-center">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-mw-accent/8 blur-[100px] animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-mw-light/10 blur-[80px] animate-float" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mw-accent/5 blur-3xl animate-glow-pulse" />

      {/* Dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(var(--mw-primary)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="mb-12 inline-flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100">
          <span className="h-2.5 w-2.5 rounded-full bg-mw-accent shadow-[0_0_0_4px_rgba(56,198,179,0.2)]" />
          <span className="text-sm font-extrabold tracking-tight text-mw-primary">Metra Wealth</span>
        </Link>

        {/* 404 display */}
        <div className="relative mb-6">
          <p className="text-[9rem] font-black leading-none tracking-tighter text-mw-border sm:text-[12rem]">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-mw-accent/20 bg-mw-accent/10 px-5 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-mw-accent">
                Page not found
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-mw-primary sm:text-3xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-3 max-w-[42ch] text-base font-light leading-relaxed text-mw-body">
          The page you&apos;re looking for may have been moved, deleted, or never existed.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="mw-btn-primary h-11 px-7 text-sm">
            ← Back to home
          </Link>
          <Link href="/dashboard" className="mw-btn-ghost h-11 px-6 text-sm">
            Go to dashboard
          </Link>
        </div>

        {/* Quick nav */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            { label: "Pricing", href: "/pricing" },
            { label: "Sign in", href: "/login" },
            { label: "Register", href: "/register" },
            { label: "AI Advisor", href: "/advisor" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mw-body transition-colors hover:text-mw-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
