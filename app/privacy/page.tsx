import Link from "next/link";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly — such as your name, email, and financial data you enter manually. We do not automatically pull data from your bank accounts without explicit consent.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your data is used solely to provide and improve Metra Wealth's features — including your financial dashboard, transaction ledger, and AI advisor. We do not sell your personal data to third parties.",
  },
  {
    title: "Data Storage & Security",
    content:
      "All data is stored securely using industry-standard encryption at rest and in transit. We follow best practices to protect your information from unauthorized access.",
  },
  {
    title: "AI Advisor & Data Processing",
    content:
      "When you use the AI Advisor, your queries may be processed to generate responses. We do not use your personal financial data to train AI models without your explicit consent.",
  },
  {
    title: "Cookies & Analytics",
    content:
      "We may use cookies and minimal analytics tools to improve the app experience. You can control cookie preferences through your browser settings.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, update, or delete your personal data at any time. Contact us through your account settings or our support email to exercise these rights.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy as the product evolves. We will notify you of any significant changes via email or an in-app notice before they take effect.",
  },
];

export default function PrivacyPage() {
  const year = new Date().getFullYear();

  return (
    <main>
      <section className="mw-shell">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8">
            <p className="mw-section-label mb-1">Legal</p>
            <h1 className="mw-title">Privacy Policy</h1>
            <p className="mt-2 text-sm text-mw-body">
              Last updated: {year}. This is a placeholder policy for the MVP. Final legal policy will be reviewed before production release.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-mw-accent/30 bg-teal-50/60 px-6 py-4 dark:bg-teal-950/20">
            <p className="text-sm font-semibold text-mw-primary">Your privacy matters to us.</p>
            <p className="mt-1 text-sm text-mw-body">
              Metra Wealth is built on the principle that your financial data belongs to you. We only collect what we need to make the app work.
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
            <Link href="/terms" className="font-semibold text-mw-primary hover:underline">
              Terms of Service →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
