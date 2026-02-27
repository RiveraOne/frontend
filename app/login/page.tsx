import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="simple-page">
      <section className="simple-card auth-card">
        <h1>Login</h1>
        <p>Access your Metra Wealth dashboard.</p>
        <form className="auth-form">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Enter your password" />

          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
        <p className="auth-meta">
          New here? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
