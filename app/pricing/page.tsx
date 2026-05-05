"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserPlan } from "@/types/user";

const essentialFeatures = [
  { label: "Smart Tracking", detail: "Log income/expenses and see your month at a glance." },
  { label: "Health Dashboard", detail: "Clear totals, category spend, and what is left." },
  { label: "Purchase Checks (Limited)", detail: "Quick sanity checks to reduce impulse spending." },
  { label: "Receipt Upload (5 GB)", detail: "Store receipts and proof of purchase securely." },
];

const proFeatures = [
  { label: "Unlimited Purchase Checks", detail: "Ask 'Can I afford this?' anytime you're about to buy." },
  { label: "Smart Budget Rules", detail: "30/30/40 tracking plus custom splits." },
  { label: "Investment Insights", detail: "Turn spare cash into strategy with live-rate refs." },
  { label: "Custom Assistant Tone", detail: "Choose Pro Advisor or Money Buddy vibe." },
  { label: "Priority AI Performance", detail: "Faster, more detailed advisor responses." },
];

const compareRows = [
  { feature: "Smart Income & Expense Tracking", essential: "✔ Full access", pro: "✔ Full access", proHighlight: false },
  { feature: "Monthly Financial Health Dashboard", essential: "✔", pro: "✔ Advanced", proHighlight: true },
  { feature: "Can I Afford This? Purchase Check", essential: "Limited checks", pro: "Unlimited", proHighlight: true },
  { feature: "Receipt Upload & Proof Storage", essential: "5 GB vault", pro: "Upgraded vault", proHighlight: true },
  { feature: "30-30-40 Smart Budget Mode", essential: "Basic tracking", pro: "Customizable splits", proHighlight: true },
  { feature: "Investment Insight Suggestions", essential: "—", pro: "✔ Gold & Index ideas", proHighlight: true },
  { feature: "Surplus Allocation Guidance", essential: "—", pro: "✔ Personalized", proHighlight: true },
  { feature: "Choose Assistant Tone", essential: "—", pro: "✔ Pro or Buddy", proHighlight: true },
  { feature: "Priority AI Performance", essential: "Standard", pro: "Faster responses", proHighlight: true },
  { feature: "Custom Themes", essential: "Standard", pro: "Library access", proHighlight: true },
];

function PlanCTA({
  plan,
  label,
  className,
}: {
  plan: UserPlan;
  label: string;
  className?: string;
}) {
  const { user, userDoc } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentPlan = userDoc?.plan ?? "free";
  const isCurrent = currentPlan === plan;

  async function handleClick() {
    if (!user) {
      router.push("/register?redirect=/pricing");
      return;
    }

    if (isCurrent) return;

    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isCurrent) {
    return (
      <span className={`inline-flex items-center justify-center rounded-xl border-2 border-mw-accent bg-mw-accent/10 px-5 py-2.5 text-sm font-bold text-mw-primary ${className ?? ""}`}>
        Current Plan ✓
      </span>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${className ?? ""} disabled:opacity-60`}
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && (
        <p className="text-center text-xs text-rose-600">{error}</p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const year = new Date().getFullYear();

  return (
    <main className="bg-gradient-to-b from-mw-soft to-mw-bg">
      <section className="mw-shell grid gap-6">
        {/* Hero header */}
        <header className="py-6 text-center">
          <p className="mw-section-label mb-2">Pricing</p>
          <h1 className="text-4xl font-black tracking-tight text-mw-primary sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-mw-body">
            Metra Wealth helps you <strong>track spending</strong>,{" "}
            <strong>stick to smart budget rules</strong>, and make{" "}
            <strong>pre-spending decisions</strong> with confidence.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="#compare" className="mw-btn-ghost w-full sm:w-auto">
              Compare Features
            </a>
            <a href="#cta" className="mw-btn-primary w-full sm:w-auto">
              Get Started
            </a>
          </div>
        </header>

        {/* Pricing cards */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* Essential */}
          <article className="mw-card p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex rounded-full border border-mw-border bg-mw-soft px-3 py-1 text-xs font-bold uppercase tracking-widest text-mw-primary">
                Essential
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-mw-primary">
              Stay on top of your money
            </h2>
            <p className="mt-2 text-sm text-mw-body">
              Perfect for building consistent tracking habits and getting quick financial checks.
            </p>

            <div className="mt-5 flex items-end gap-1">
              <span className="text-5xl font-black tracking-tight text-mw-primary">$4.99</span>
              <span className="mb-1.5 text-sm font-semibold text-mw-light">/month</span>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-mw-light">
              Cancel anytime · Beta pricing
            </p>

            <PlanCTA plan="essential" label="Choose Essential" className="mw-btn-ghost mt-5 w-full" />

            <div className="mw-divider" />

            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mw-primary">
              What you get
            </p>
            <ul className="space-y-3">
              {essentialFeatures.map((f) => (
                <li key={f.label} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                    ✓
                  </span>
                  <span>
                    <strong className="text-mw-primary">{f.label}</strong>
                    <br />
                    <span className="text-mw-body">{f.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>

          {/* Pro */}
          <article className="mw-card relative border-2 border-mw-accent bg-gradient-to-b from-mw-soft to-mw-bg p-6 dark:from-mw-surface dark:to-mw-bg">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-mw-accent to-mw-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-sm">
                ★ Most Popular
              </span>
              <span className="inline-flex rounded-full border border-mw-accent/30 bg-mw-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-mw-primary">
                Pro
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-mw-primary">
              Spend smarter. Grow faster.
            </h2>
            <p className="mt-2 text-sm text-mw-body">
              Full decision-support mode: budgeting rules, advanced insights, and customizable settings.
            </p>

            <div className="mt-5 flex items-end gap-1">
              <span className="text-5xl font-black tracking-tight text-mw-primary">$9.99</span>
              <span className="mb-1.5 text-sm font-semibold text-mw-light">/month</span>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-mw-light">
              Cancel anytime · Beta pricing
            </p>

            <PlanCTA plan="pro" label="Choose Pro" className="mw-btn-primary mt-5 w-full" />

            <div className="mw-divider" />

            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mw-primary">
              Everything in Essential, plus:
            </p>
            <ul className="space-y-3">
              {proFeatures.map((f) => (
                <li key={f.label} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mw-accent to-mw-primary text-[10px] font-bold text-white">
                    ★
                  </span>
                  <span>
                    <strong className="text-mw-primary">{f.label}</strong>
                    <br />
                    <span className="text-mw-body">{f.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* Full feature comparison */}
        <section id="compare" className="mw-card p-6">
          <h2 className="text-2xl font-black tracking-tight text-mw-primary">
            Full Feature Comparison
          </h2>
          <p className="mt-1 text-sm text-mw-body">
            Everything you can do in Metra Wealth — side by side.
          </p>

          {/* Mobile: stacked cards */}
          <div className="mt-5 space-y-3 sm:hidden">
            {compareRows.map((row) => (
              <div key={row.feature} className="rounded-xl border border-mw-border bg-mw-soft/50 p-4">
                <p className="mb-3 text-sm font-semibold text-mw-dark">{row.feature}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-mw-light">Essential</p>
                    <p className="text-sm text-mw-body">{row.essential}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-mw-accent">Pro</p>
                    <p className={`text-sm font-semibold ${row.proHighlight && row.pro !== "—" ? "text-teal-700 dark:text-teal-400" : "text-mw-body"}`}>
                      {row.pro}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="mt-5 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-mw-border">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-mw-light">Feature</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-mw-light">
                    Essential <span className="font-normal normal-case tracking-normal">$4.99/mo</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-mw-accent">
                    Pro <span className="font-normal normal-case tracking-normal text-mw-light">$9.99/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-mw-border/60 transition-colors hover:bg-mw-soft ${i % 2 === 0 ? "" : "bg-mw-soft/30"}`}
                  >
                    <td className="px-4 py-3.5 text-mw-dark">{row.feature}</td>
                    <td className="px-4 py-3.5 text-mw-body">{row.essential}</td>
                    <td className={`px-4 py-3.5 font-semibold ${row.proHighlight && row.pro !== "—" ? "text-teal-700 dark:text-teal-400" : "text-mw-body"}`}>
                      {row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section
          id="cta"
          className="mw-card overflow-hidden bg-gradient-to-r from-mw-soft via-white to-teal-50/50 p-6 dark:from-mw-surface dark:via-mw-surface dark:to-teal-950/10"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight text-mw-primary sm:text-2xl">
                Ready to run your money like a system?
              </h3>
              <p className="mt-1 text-sm text-mw-body">
                Start with Essential, upgrade anytime. Your data stays yours.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-shrink-0">
              <PlanCTA plan="essential" label="Start Essential" className="mw-btn-ghost w-full sm:w-auto" />
              <PlanCTA plan="pro" label="Start Pro →" className="mw-btn-primary w-full sm:w-auto" />
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center text-xs font-semibold uppercase tracking-widest text-mw-light">
          © {year} Metra Wealth · Beta pricing subject to change · Not financial advice
        </footer>
      </section>
    </main>
  );
}
