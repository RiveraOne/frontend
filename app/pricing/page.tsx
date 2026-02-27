export default function PricingPage() {
  const year = new Date().getFullYear();

  return (
    <main className="container">
      <header className="header">
        <div className="brand-group">
          <img src="/metra-wealth-logo.png" alt="Metra Wealth" className="logo-img" />
          <div>
            <div className="brand-tag">Pricing</div>
            <div className="brand-headline">Choose your plan</div>
          </div>
        </div>
        <div className="header-actions">
          <a href="#compare" className="btn btn-ghost">
            Compare Features
          </a>
          <a href="#cta" className="btn btn-primary">
            Get Started
          </a>
        </div>
      </header>

      <div className="subheadline">
        Metra Wealth helps you <b>track spending</b>, <b>stick to smart budget rules</b>, and
        make <b>pre-spending decisions</b> with confidence without feeling restricted.
      </div>

      <div className="pricing-grid">
        <section className="card">
          <span className="badge">Essential</span>
          <div className="card-header">
            <h2>Stay on top of your money</h2>
            <div className="card-desc">
              Perfect for building consistent tracking habits and getting quick financial checks.
            </div>
          </div>

          <div className="price-tag">
            <span className="price-val">$4.99</span>
            <span className="price-period">/mo</span>
          </div>
          <div className="price-sub">Cancel anytime • Beta pricing</div>

          <a href="#cta" className="btn btn-ghost btn-card">
            Choose Essential
          </a>

          <div className="divider" />

          <div className="features-title">What you get</div>
          <ul className="feature-list">
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Smart Tracking</strong>
                <br />
                <span className="feature-sub">Log income/expenses and see your month at a glance.</span>
              </div>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Health Dashboard</strong>
                <br />
                <span className="feature-sub">Clear totals, category spend, and what is left.</span>
              </div>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Purchase Checks (Limited)</strong>
                <br />
                <span className="feature-sub">Quick sanity checks to reduce impulse spending.</span>
              </div>
            </li>
          </ul>
        </section>

        <section className="card card-featured">
          <span className="tag-popular">Most Popular</span>
          <span className="badge">Pro</span>
          <div className="card-header">
            <h2>Spend smarter. Grow faster.</h2>
            <div className="card-desc">
              Full decision-support mode: budgeting rules, advanced insights, and customizable vibes.
            </div>
          </div>

          <div className="price-tag">
            <span className="price-val">$9.99</span>
            <span className="price-period">/mo</span>
          </div>
          <div className="price-sub">Cancel anytime • Beta pricing</div>

          <a href="#cta" className="btn btn-primary btn-card">
            Choose Pro
          </a>

          <div className="divider" />

          <div className="features-title">Everything in Essential, plus:</div>
          <ul className="feature-list">
            <li className="feature-item">
              <span className="feature-icon">★</span>
              <div>
                <strong>Unlimited Purchase Checks</strong>
                <br />
                <span className="feature-sub">Ask can I afford this? anytime you are about to buy.</span>
              </div>
            </li>
            <li className="feature-item">
              <span className="feature-icon">★</span>
              <div>
                <strong>Smart Budget Rules</strong>
                <br />
                <span className="feature-sub">30/30/40 tracking plus custom splits.</span>
              </div>
            </li>
            <li className="feature-item">
              <span className="feature-icon">★</span>
              <div>
                <strong>Investment Insights</strong>
                <br />
                <span className="feature-sub">Turn spare cash into strategy with live-rate refs.</span>
              </div>
            </li>
            <li className="feature-item">
              <span className="feature-icon">★</span>
              <div>
                <strong>Custom Assistant Tone</strong>
                <br />
                <span className="feature-sub">Choose Pro Advisor or Money Buddy vibe.</span>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <section id="compare" className="table-wrapper">
        <div className="table-header">
          <h2>Full Feature Comparison</h2>
          <p>Everything you can do in Metra Wealth side-by-side.</p>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Essential ($4.99/mo)</th>
                <th>Pro ($9.99/mo)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Smart Income and Expense Tracking</td>
                <td className="cell-check">✔ Full access</td>
                <td className="cell-check">✔ Full access</td>
              </tr>
              <tr>
                <td>Monthly Financial Health Dashboard</td>
                <td className="cell-check">✔</td>
                <td className="cell-check">✔ Advanced</td>
              </tr>
              <tr>
                <td>Can I Afford This? Purchase Check</td>
                <td>Limited checks</td>
                <td className="cell-check">Unlimited</td>
              </tr>
              <tr>
                <td>Receipt Upload and Proof Storage</td>
                <td>5GB vault</td>
                <td>Upgraded vault</td>
              </tr>
              <tr>
                <td>30-30-40 Smart Budget Mode</td>
                <td>Basic tracking</td>
                <td className="cell-check">Customizable splits</td>
              </tr>
              <tr>
                <td>Investment Insight Suggestions</td>
                <td className="cell-na">-</td>
                <td className="cell-check">✔ Gold and Index ideas</td>
              </tr>
              <tr>
                <td>Surplus Allocation Guidance</td>
                <td className="cell-na">-</td>
                <td className="cell-check">✔ Personalized</td>
              </tr>
              <tr>
                <td>Choose Assistant Tone</td>
                <td className="cell-na">-</td>
                <td className="cell-check">✔ Pro or Buddy</td>
              </tr>
              <tr>
                <td>Priority AI Performance</td>
                <td>Standard</td>
                <td className="cell-check">Faster responses</td>
              </tr>
              <tr>
                <td>Custom Themes</td>
                <td>Standard</td>
                <td className="cell-check">Library access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="cta" className="cta-section">
        <div className="cta-text">
          <h3>Ready to run your money like a system?</h3>
          <p>Start with Essential, upgrade anytime. Your data stays yours.</p>
        </div>
        <div className="cta-actions">
          <a href="#" className="btn btn-ghost">
            Download App
          </a>
          <a href="#" className="btn btn-primary">
            Start Pro
          </a>
        </div>
      </section>

      <footer className="footer">© {year} Metra Wealth • Beta pricing subject to change • Not financial advice</footer>
    </main>
  );
}
