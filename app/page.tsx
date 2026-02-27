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
    <main className="home-page">
      <div className="home-container">
        <section className="home-hero">
          <div>
            <p className="eyebrow">AI Financial Companion</p>
            <h1>Build a money system you can trust every week.</h1>
            <p className="home-subtext">
              Metra Wealth helps you track spending, protect your balance, and make better
              decisions before you buy.
            </p>
            <div className="simple-actions">
              <Link href="/register" className="btn btn-primary">
                Start Free
              </Link>
              <Link href="/pricing" className="btn btn-ghost">
                See Pricing
              </Link>
            </div>
            <div className="home-proof">
              <span>✓ Setup in minutes</span>
              <span>✓ No cards required</span>
              <span>✓ Upgrade anytime</span>
            </div>
          </div>

          <aside className="lead-card">
            <h2>Get early access</h2>
            <p>Join the waitlist and receive onboarding updates.</p>
            <form action="/register" className="lead-form">
              <label htmlFor="lead-name">Name</label>
              <input id="lead-name" type="text" placeholder="Your name" />
              <label htmlFor="lead-email">Email</label>
              <input id="lead-email" type="email" placeholder="you@example.com" />
              <button className="btn btn-primary" type="submit">
                Get Started
              </button>
            </form>
          </aside>
        </section>

        <section className="trust-strip" aria-label="Trust indicators">
          <span>Practical planning</span>
          <span>Clean dashboard</span>
          <span>Decision-first workflow</span>
          <span>Designed for consistency</span>
        </section>

        <section className="home-section">
          <h2>Why people choose Metra Wealth</h2>
          <div className="home-grid">
            {featureList.map((feature) => (
              <article key={feature.title} className="home-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section">
          <h2>How it works</h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article key={step.title} className="step-card">
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section pricing-preview">
          <h2>Simple plans for every stage</h2>
          <div className="preview-grid">
            <article className="preview-card">
              <h3>Free Plan</h3>
              <p className="price">$0/mo</p>
              <p>Core tracking, dashboard view, and basic advisor access.</p>
            </article>
            <article className="preview-card highlight">
              <h3>Premium Plan</h3>
              <p className="price">$9.99/mo</p>
              <p>Advanced insights, unlimited checks, and priority AI responses.</p>
            </article>
          </div>
          <Link href="/pricing" className="btn btn-primary">
            Compare Full Pricing
          </Link>
        </section>

        <section className="home-section faq">
          <h2>Frequently asked questions</h2>
          {faqs.map((item) => (
            <article key={item.question} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </section>

        <section className="final-cta">
          <h2>Start building your financial system today.</h2>
          <p>Use the MVP now. Backend integrations can be added as you scale.</p>
          <div className="simple-actions">
            <Link href="/register" className="btn btn-primary">
              Create Account
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
