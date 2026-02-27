import Link from "next/link";

export default function PricingPage() {
  const year = new Date().getFullYear();

  return (
    <main className="bg-gradient-to-b from-[#f5fbfa] via-white to-white">
      <section className="mw-shell grid gap-5">
        <header className="mw-card grid gap-4 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <img
              src="/metra-wealth-logo.png"
              alt="Metra Wealth"
              className="h-14 w-14 rounded-xl border border-mw-border bg-white object-contain p-2"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-mw-light">Pricing</p>
              <h1 className="text-3xl font-black tracking-tight text-mw-primary sm:text-4xl">Choose your plan</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="#compare" className="mw-btn-ghost">
              Compare Features
            </a>
            <a href="#cta" className="mw-btn-primary">
              Get Started
            </a>
          </div>
        </header>

        <section className="mw-card p-6">
          <p className="text-sm text-mw-body sm:text-base">
            Metra Wealth helps you <b>track spending</b>, <b>stick to smart budget rules</b>, and make{" "}
            <b>pre-spending decisions</b> with confidence without feeling restricted.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="mw-card p-6">
            <span className="inline-flex rounded-full border border-mw-border bg-[#f4fbfa] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">
              Essential
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-mw-primary">Stay on top of your money</h2>
            <p className="mt-2 text-sm text-mw-body">
              Perfect for building consistent tracking habits and getting quick financial checks.
            </p>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-black text-mw-primary">$4.99</span>
              <span className="mb-1 text-sm font-semibold text-mw-light">/mo</span>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-mw-light">Cancel anytime • Beta pricing</p>

            <a href="#cta" className="mw-btn-ghost mt-4 w-full">
              Choose Essential
            </a>

            <div className="my-5 h-px bg-mw-border" />

            <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-mw-primary">What you get</h3>
            <ul className="mt-3 space-y-3">
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f8f5] text-xs font-bold text-[#0e7f73]">✓</span>
                <span>
                  <strong className="text-mw-primary">Smart Tracking</strong>
                  <br />
                  <span className="text-mw-body">Log income/expenses and see your month at a glance.</span>
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f8f5] text-xs font-bold text-[#0e7f73]">✓</span>
                <span>
                  <strong className="text-mw-primary">Health Dashboard</strong>
                  <br />
                  <span className="text-mw-body">Clear totals, category spend, and what is left.</span>
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f8f5] text-xs font-bold text-[#0e7f73]">✓</span>
                <span>
                  <strong className="text-mw-primary">Purchase Checks (Limited)</strong>
                  <br />
                  <span className="text-mw-body">Quick sanity checks to reduce impulse spending.</span>
                </span>
              </li>
            </ul>
          </article>

          <article className="mw-card relative border-2 border-mw-accent bg-gradient-to-b from-white to-[#f2fcfa] p-6">
            <span className="absolute -top-3 right-4 rounded-full bg-mw-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
              Most Popular
            </span>
            <span className="inline-flex rounded-full border border-mw-border bg-[#f4fbfa] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">
              Pro
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-mw-primary">Spend smarter. Grow faster.</h2>
            <p className="mt-2 text-sm text-mw-body">
              Full decision-support mode: budgeting rules, advanced insights, and customizable vibes.
            </p>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-black text-mw-primary">$9.99</span>
              <span className="mb-1 text-sm font-semibold text-mw-light">/mo</span>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-mw-light">Cancel anytime • Beta pricing</p>

            <a href="#cta" className="mw-btn-primary mt-4 w-full">
              Choose Pro
            </a>

            <div className="my-5 h-px bg-mw-border" />

            <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-mw-primary">Everything in Essential, plus:</h3>
            <ul className="mt-3 space-y-3">
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e7f6f6] text-xs font-bold text-mw-primary">★</span>
                <span>
                  <strong className="text-mw-primary">Unlimited Purchase Checks</strong>
                  <br />
                  <span className="text-mw-body">Ask can I afford this? anytime you are about to buy.</span>
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e7f6f6] text-xs font-bold text-mw-primary">★</span>
                <span>
                  <strong className="text-mw-primary">Smart Budget Rules</strong>
                  <br />
                  <span className="text-mw-body">30/30/40 tracking plus custom splits.</span>
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e7f6f6] text-xs font-bold text-mw-primary">★</span>
                <span>
                  <strong className="text-mw-primary">Investment Insights</strong>
                  <br />
                  <span className="text-mw-body">Turn spare cash into strategy with live-rate refs.</span>
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e7f6f6] text-xs font-bold text-mw-primary">★</span>
                <span>
                  <strong className="text-mw-primary">Custom Assistant Tone</strong>
                  <br />
                  <span className="text-mw-body">Choose Pro Advisor or Money Buddy vibe.</span>
                </span>
              </li>
            </ul>
          </article>
        </section>

        <section id="compare" className="mw-card p-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-mw-primary">Full Feature Comparison</h2>
            <p className="mt-1 text-sm text-mw-body">Everything you can do in Metra Wealth side-by-side.</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[680px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-mw-border bg-[#f8fefe]">
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Feature</th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Essential ($4.99/mo)</th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-mw-primary">Pro ($9.99/mo)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">Smart Income and Expense Tracking</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">✔ Full access</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">✔ Full access</td>
                </tr>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">Monthly Financial Health Dashboard</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">✔</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">✔ Advanced</td>
                </tr>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">Can I Afford This? Purchase Check</td>
                  <td className="px-3 py-3">Limited checks</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">Unlimited</td>
                </tr>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">Receipt Upload and Proof Storage</td>
                  <td className="px-3 py-3">5GB vault</td>
                  <td className="px-3 py-3">Upgraded vault</td>
                </tr>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">30-30-40 Smart Budget Mode</td>
                  <td className="px-3 py-3">Basic tracking</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">Customizable splits</td>
                </tr>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">Investment Insight Suggestions</td>
                  <td className="px-3 py-3 text-mw-light">-</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">✔ Gold and Index ideas</td>
                </tr>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">Surplus Allocation Guidance</td>
                  <td className="px-3 py-3 text-mw-light">-</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">✔ Personalized</td>
                </tr>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">Choose Assistant Tone</td>
                  <td className="px-3 py-3 text-mw-light">-</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">✔ Pro or Buddy</td>
                </tr>
                <tr className="border-b border-mw-border/60">
                  <td className="px-3 py-3">Priority AI Performance</td>
                  <td className="px-3 py-3">Standard</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">Faster responses</td>
                </tr>
                <tr>
                  <td className="px-3 py-3">Custom Themes</td>
                  <td className="px-3 py-3">Standard</td>
                  <td className="px-3 py-3 font-semibold text-[#0f7b70]">Library access</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="cta" className="mw-card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-white to-[#eefaf8] p-6">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-mw-primary">Ready to run your money like a system?</h3>
            <p className="mt-1 text-sm text-mw-body">Start with Essential, upgrade anytime. Your data stays yours.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/register" className="mw-btn-ghost">
              Download App
            </Link>
            <Link href="/register" className="mw-btn-primary">
              Start Pro
            </Link>
          </div>
        </section>

        <footer className="text-center text-xs font-semibold uppercase tracking-[0.08em] text-mw-light">
          © {year} Metra Wealth • Beta pricing subject to change • Not financial advice
        </footer>
      </section>
    </main>
  );
}
