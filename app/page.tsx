import Link from "next/link";

const featureList = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Live Money Clarity",
    description: "Track income and expenses in one place with balance visibility at all times.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Pre-Spend Decision Support",
    description: "Check affordability before purchases and reduce impulse spending.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
      </svg>
    ),
    title: "Simple Financial System",
    description: "Use practical budgeting rules and keep your plan easy to follow.",
  },
];

const steps = [
  { num: "01", title: "Connect your routine", detail: "Log transactions daily in under a minute." },
  { num: "02", title: "See your true position", detail: "Get instant totals for income, expenses, and balance." },
  { num: "03", title: "Decide with confidence", detail: "Use advisor prompts before major purchases." },
];

const faqs = [
  {
    question: "Do I need to connect my bank now?",
    answer: "No. Start with manual tracking immediately — bank connection is optional and can be added later.",
  },
  {
    question: "Can I start free and upgrade later?",
    answer: "Yes. Start with the base workflow and move to premium features anytime.",
  },
  {
    question: "Is this financial advice?",
    answer: "No. Metra Wealth provides planning support and guidance tools only.",
  },
];

const TICKER = [
  "Practical planning",
  "Clean dashboard",
  "Decision-first workflow",
  "Designed for consistency",
  "Privacy first",
];

const BAR_HEIGHTS = [40, 65, 50, 80, 55, 90, 70];

export default function Home() {
  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative bg-mw-bg">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(56,198,179,0.12),transparent)]" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          {/* Left: copy */}
          <div>
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mw-accent/25 bg-mw-accent/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mw-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-mw-light">
                AI Financial Companion
              </span>
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-mw-primary lg:text-6xl">
              Build a money system you can{" "}
              <span className="bg-gradient-to-r from-mw-light to-mw-accent bg-clip-text text-transparent">
                trust every week.
              </span>
            </h1>

            <p className="mt-6 max-w-[44ch] text-lg font-light leading-relaxed text-mw-body">
              Metra Wealth helps you track spending, protect your balance, and
              make smarter decisions before you buy — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="mw-btn-primary h-12 px-7 text-base">
                Start free →
              </Link>
              <Link href="/pricing" className="mw-btn-ghost h-12 px-6 text-base">
                See pricing
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {["✓ Setup in minutes", "✓ No card required", "✓ Upgrade anytime"].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-mw-border bg-mw-surface px-3.5 py-1 text-xs font-medium text-mw-body"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Right: early access card */}
          <div className="mw-card relative overflow-hidden p-8 shadow-xl shadow-mw-primary/5">
            {/* Top accent bar */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-mw-light to-mw-accent" />

            <p className="mw-section-label mb-1">Early access</p>
            <h2 className="text-2xl font-black tracking-tight text-mw-primary">
              Get early access
            </h2>
            <p className="mt-1 text-sm text-mw-body">
              Join the waitlist and receive onboarding updates.
            </p>

            <form action="/register" className="mt-6 grid gap-3">
              <div>
                <label htmlFor="lead-name" className="mw-label mb-1.5 block">
                  Name
                </label>
                <input
                  id="lead-name"
                  type="text"
                  placeholder="Your name"
                  className="mw-input"
                />
              </div>
              <div>
                <label htmlFor="lead-email" className="mw-label mb-1.5 block">
                  Email
                </label>
                <input
                  id="lead-email"
                  type="email"
                  placeholder="you@example.com"
                  className="mw-input"
                />
              </div>
              <button type="submit" className="mw-btn-primary mt-1 h-11 w-full text-base">
                Get started →
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-mw-body">
              No credit card required · Free forever plan available
            </p>
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────── */}
      <div className="border-y border-mw-border bg-mw-soft">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-around gap-4 px-5 py-4">
          {TICKER.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-mw-accent" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-mw-light">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────── */}
      <section id="features" className="bg-mw-bg py-24">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="mw-section-label mb-2">Why Metra Wealth</p>
          <h2 className="text-4xl font-black tracking-tight text-mw-primary">
            Everything you need to own your finances.
          </h2>
          <p className="mt-3 max-w-[55ch] text-base font-light leading-relaxed text-mw-body">
            A focused toolkit built around clarity, confidence, and consistency — not complexity.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {featureList.map((f) => (
              <article
                key={f.title}
                className="group mw-card cursor-default p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-mw-primary/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-mw-soft text-mw-primary transition-colors group-hover:bg-mw-accent/10 group-hover:text-mw-accent">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-mw-primary">{f.title}</h3>
                <p className="text-sm font-light leading-relaxed text-mw-body">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section id="how-it-works" className="bg-mw-soft py-24">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
          {/* Steps */}
          <div>
            <p className="mw-section-label mb-2">How it works</p>
            <h2 className="text-4xl font-black tracking-tight text-mw-primary">
              Three steps to financial clarity.
            </h2>
            <p className="mt-3 max-w-[46ch] text-base font-light leading-relaxed text-mw-body">
              No complex setup. Just a straightforward system that works from day one.
            </p>

            <div className="mt-10 flex flex-col gap-4">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="mw-card flex cursor-default gap-5 p-5 transition-all hover:shadow-md hover:shadow-mw-primary/5"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mw-light to-mw-accent text-sm font-black text-white">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-bold text-mw-primary">{step.title}</h3>
                    <p className="mt-0.5 text-sm font-light text-mw-body">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual dashboard card — intentionally always-dark for contrast */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2f38] to-[#051a20] p-8 shadow-2xl">
            {/* Glow orb */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mw-accent/15 blur-3xl" />

            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Live Balance
            </p>

            <div className="my-8 text-center">
              <p className="mb-1 text-xs text-white/50">Available funds</p>
              <p className="text-6xl font-black tracking-tight text-white">$4,280</p>
              <p className="mt-2 text-sm font-semibold text-mw-accent">↑ $340 this week</p>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                Weekly activity
              </p>
              <div className="flex h-16 items-end gap-1.5">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all ${
                      i === 5
                        ? "bg-gradient-to-t from-mw-light to-mw-accent"
                        : "bg-white/10"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-white/30">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span className="text-mw-accent">Sat</span><span>Sun</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ───────────────────────── */}
      <section id="pricing" className="bg-mw-bg py-24">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="mw-section-label mb-2">Pricing</p>
          <h2 className="text-4xl font-black tracking-tight text-mw-primary">
            Simple plans for every stage.
          </h2>
          <p className="mt-3 max-w-[50ch] text-base font-light leading-relaxed text-mw-body">
            Start free, scale when you&apos;re ready. No hidden fees, no long-term lock-in.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {/* Free */}
            <article className="mw-card p-7">
              <p className="mw-section-label mb-4">Free plan</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black tracking-tight text-mw-primary">$0</span>
                <span className="mb-1.5 text-sm text-mw-body">/ month</span>
              </div>
              <p className="mt-4 text-sm font-light leading-relaxed text-mw-body">
                Core tracking, dashboard view, and basic advisor access. Perfect for getting started.
              </p>
              <Link href="/register" className="mw-btn-ghost mt-6 w-full">
                Start for free →
              </Link>
            </article>

            {/* Pro */}
            <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b2f38] to-[#051a20] p-7 shadow-xl shadow-mw-primary/20">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-mw-accent/15 blur-2xl" />
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-mw-accent/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-mw-accent">
                ★ Most popular
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pro plan</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-5xl font-black tracking-tight text-white">$9.99</span>
                <span className="mb-1.5 text-sm text-white/50">/ month</span>
              </div>
              <p className="mt-4 text-sm font-light leading-relaxed text-white/65">
                Advanced insights, unlimited checks, and priority AI responses. The full picture for serious financial clarity.
              </p>
              <Link
                href="/pricing"
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-mw-accent font-bold text-sm text-[#051a20] transition-all hover:bg-white"
              >
                Get Pro →
              </Link>
            </article>
          </div>

          <div className="mt-5 text-center">
            <Link href="/pricing" className="text-sm font-semibold text-mw-primary hover:underline">
              Compare all features →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────── */}
      <section className="bg-mw-soft py-24">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="mw-section-label mb-2">FAQ</p>
          <h2 className="text-4xl font-black tracking-tight text-mw-primary">
            Common questions, honest answers.
          </h2>
          <p className="mt-3 max-w-[46ch] text-base font-light leading-relaxed text-mw-body">
            Everything you need to know before getting started.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="mw-card cursor-default p-6 transition-all hover:shadow-md hover:shadow-mw-primary/5"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-mw-soft text-mw-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="mb-2 text-sm font-bold text-mw-primary">{item.question}</h3>
                <p className="text-sm font-light leading-relaxed text-mw-body">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="bg-mw-bg py-16">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2f38] via-[#0b4f5a] to-[#0d6b78] px-8 py-16 text-center shadow-2xl">
            {/* Glow orbs */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-mw-accent/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-mw-accent/10 blur-3xl" />

            <p className="mw-section-label relative z-10 mb-3 text-mw-accent">
              Start today
            </p>
            <h2 className="relative z-10 mx-auto max-w-[22ch] text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
              Build your financial system. Start this week.
            </h2>
            <p className="relative z-10 mt-4 text-base font-light text-white/60">
              Use the app now. Connect your bank and scale as you grow.
            </p>
            <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-mw-accent px-7 text-sm font-bold text-[#051a20] transition-all hover:bg-white"
              >
                Create free account →
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
