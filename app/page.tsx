import Link from "next/link";

export default function Home() {
  return (
    <main className="simple-page">
      <section className="simple-card hero-card">
        <p className="eyebrow">Metra Wealth</p>
        <h1>Money clarity with simple, smart tools.</h1>
        <p>
          Track spending, plan ahead, and choose the subscription that fits your pace.
        </p>
        <div className="simple-actions">
          <Link href="/pricing" className="btn btn-primary">
            View Pricing
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Login
          </Link>
          <Link href="/register" className="btn btn-ghost">
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
