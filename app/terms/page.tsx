import Link from "next/link";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using Metra Wealth, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.",
  },
  {
    title: "Use of the Service",
    content:
      "Metra Wealth provides financial planning tools and guidance support only. You agree to use the service for lawful purposes and in accordance with these terms. You are responsible for all data you enter into the app.",
  },
  {
    title: "Not Financial Advice",
    content:
      "Metra Wealth is a financial planning tool, not a licensed financial advisor. Nothing in the app, including AI advisor responses, constitutes financial, legal, tax, or investment advice. Always consult a qualified professional for important financial decisions.",
  },
  {
    title: "Account Responsibility",
    content:
      "You are responsible for maintaining the security of your account credentials. Notify us immediately if you suspect unauthorized access. We are not liable for losses resulting from unauthorized account use.",
  },
  {
    title: "Subscription & Billing",
    content:
      "Paid subscriptions are billed on a recurring basis. You may cancel at any time from your account settings. Cancellations take effect at the end of the current billing period. We reserve the right to modify pricing with reasonable notice.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, features, and functionality of Metra Wealth are owned by Metra Wealth and protected by applicable intellectual property laws. You may not copy, modify, or distribute any part of the app without prior written consent.",
  },
  {
    title: "Limitation of Liability",
    content:
      "Metra Wealth is provided 'as is' without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.",
  },
  {
    title: "Changes to Terms",
    content:
      "We may update these Terms at any time. Continued use of the app after changes constitutes acceptance of the new terms. We will notify users of material changes via email or in-app notification.",
  },
];

export default function TermsPage() {
  const year = new Date().getFullYear();

  return (
    <main>
      <section className="mw-shell">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8">
            <p className="mw-section-label mb-1">Legal</p>
            <h1 className="mw-title">Terms of Service</h1>
            <p className="mt-2 text-sm text-mw-body">
              Last updated: {year}. This is a placeholder for the MVP. Final legal terms will be reviewed by counsel before production release.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 px-6 py-4 dark:border-amber-900 dark:bg-amber-950/20">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Important reminder</p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              Metra Wealth provides planning support tools only — not financial, legal, or investment advice. Always consult a qualified professional for major financial decisions.
            </p>
          </div>

          <div className="mw-card divide-y divide-mw-border overflow-hidden">
            {sections.map((s, i) => (
              <div key={s.title} className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-mw-soft text-xs font-bold text-mw-primary">
                    {i + 1}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-mw-primary">{s.title}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-mw-body">{s.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-mw-body">
            <p>© {year} Metra Wealth. Not financial advice.</p>
            <Link href="/privacy" className="font-semibold text-mw-primary hover:underline">
              Privacy Policy →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
