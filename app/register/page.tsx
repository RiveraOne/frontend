import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="simple-page">
      <section className="simple-card auth-card">
        <h1>Register</h1>
        <p>Create your Metra Wealth account.</p>
        <form className="auth-form">
          <label htmlFor="name">Full name</label>
          <input id="name" type="text" placeholder="Your name" />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Create a password" />

          <button type="submit" className="btn btn-primary">
            Register
          </button>
        </form>
        <p className="auth-meta">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
