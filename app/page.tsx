import Link from "next/link";

export default function Home() {
  const featureList = [
    {
      title: "Live Money Clarity",
      description: "Track income and expenses in one place with balance visibility at all times."
    },
    {
      title: "Pre-Spend Decision Support",
      description: "Check affordability before purchases and reduce impulse spending."
    },
    {
      title: "Simple Financial System",
      description: "Use practical budgeting rules and keep your plan easy to follow."
    }
  ];

  const steps = [
    { title: "Connect your routine", detail: "Log transactions daily in under a minute." },
    { title: "See your true position", detail: "Get instant totals for income, expenses, and balance." },
    { title: "Decide with confidence", detail: "Use advisor prompts before major purchases." }
  ];

  const faqs = [
    {
      question: "Do I need to connect my bank now?",
      answer: "No. MVP flow uses manual tracking first so you can start immediately."
    },
    {
      question: "Can I start free and upgrade later?",
      answer: "Yes. Start with the base workflow and move to premium features anytime."
    },
    {
      question: "Is this financial advice?",
      answer: "No. Metra Wealth provides planning support and guidance tools only."
    }
  ];

  return (
    <main className="bg-gradient-to-b from-[#f5fbfa] via-white to-white">
      <div className="mw-shell grid gap-5">
        <section className="mw-card grid gap-5 p-7 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-mw-light">AI Financial Companion</p>
            <h1 className="mt-2 max-w-[16ch] text-4xl font-black leading-tight tracking-tight text-mw-primary sm:text-5xl">
              Build a money system you can trust every week.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-mw-body">
              Metra Wealth helps you track spending, protect your balance, and make better decisions before you buy.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/register" className="mw-btn-primary">Start Free</Link>
              <Link href="/pricing" className="mw-btn-ghost">See Pricing</Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-mw-light">
              <span className="rounded-full border border-mw-border bg-[#f9fefe] px-3 py-1">Setup in minutes</span>
              <span className="rounded-full border border-mw-border bg-[#f9fefe] px-3 py-1">No cards required</span>
              <span className="rounded-full border border-mw-border bg-[#f9fefe] px-3 py-1">Upgrade anytime</span>
            </div>
          </div>

          <aside className="rounded-2xl border border-mw-border bg-gradient-to-b from-white to-[#f4fbfa] p-5">
            <h2 className="text-2xl font-extrabold tracking-tight text-mw-primary">Get early access</h2>
            <p className="mt-1 text-sm text-mw-body">Join the waitlist and receive onboarding updates.</p>
            <form action="/register" className="mt-4 grid gap-2">
              <label htmlFor="lead-name" className="mw-label">Name</label>
              <input id="lead-name" type="text" placeholder="Your name" className="mw-input" />
              <label htmlFor="lead-email" className="mw-label">Email</label>
              <input id="lead-email" type="email" placeholder="you@example.com" className="mw-input" />
              <button className="mw-btn-primary mt-2" type="submit">Get Started</button>
            </form>
          </aside>
        </section>

        <section className="mw-card flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-mw-light">
          <span>Practical planning</span>
          <span>Clean dashboard</span>
          <span>Decision-first workflow</span>
          <span>Designed for consistency</span>
        </section>

        <section className="mw-card p-6">
          <h2 className="mw-title text-[1.75rem]">Why people choose Metra Wealth</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {featureList.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-mw-border bg-[#fbfefe] p-4">
                <h3 className="text-lg font-bold text-mw-primary">{feature.title}</h3>
                <p className="mt-2 text-sm text-mw-body">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mw-card p-6">
          <h2 className="mw-title text-[1.75rem]">How it works</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-xl border border-mw-border bg-[#fbfefe] p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-mw-accent to-mw-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-bold text-mw-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-mw-body">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mw-card p-6">
          <h2 className="mw-title text-[1.75rem]">Simple plans for every stage</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-mw-border bg-[#fbfefe] p-4">
              <h3 className="text-lg font-bold text-mw-primary">Free Plan</h3>
              <p className="mt-1 text-3xl font-black text-mw-primary">$0/mo</p>
              <p className="mt-2 text-sm text-mw-body">Core tracking, dashboard view, and basic advisor access.</p>
            </article>
            <article className="rounded-xl border-2 border-mw-accent bg-gradient-to-b from-white to-[#f5fcfb] p-4">
              <h3 className="text-lg font-bold text-mw-primary">Premium Plan</h3>
              <p className="mt-1 text-3xl font-black text-mw-primary">$9.99/mo</p>
              <p className="mt-2 text-sm text-mw-body">Advanced insights, unlimited checks, and priority AI responses.</p>
            </article>
          </div>
          <Link href="/pricing" className="mw-btn-primary mt-4">Compare Full Pricing</Link>
        </section>

        <section className="mw-card p-6">
          <h2 className="mw-title text-[1.75rem]">Frequently asked questions</h2>
          <div className="mt-4 grid gap-3">
            {faqs.map((item) => (
              <article key={item.question} className="rounded-xl border border-mw-border bg-[#fbfefe] p-4">
                <h3 className="text-base font-bold text-mw-primary">{item.question}</h3>
                <p className="mt-2 text-sm text-mw-body">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mw-card bg-gradient-to-r from-white to-[#eefaf8] p-6">
          <h2 className="text-3xl font-black tracking-tight text-mw-primary">Start building your financial system today.</h2>
          <p className="mt-2 text-sm text-mw-body">Use the MVP now. Backend integrations can be added as you scale.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/register" className="mw-btn-primary">Create Account</Link>
            <Link href="/login" className="mw-btn-ghost">Login</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
