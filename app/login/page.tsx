import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="bg-gradient-to-b from-[#f5fbfa] to-white">
      <section className="mw-shell grid place-items-center">
        <div className="mw-card w-full max-w-md p-7">
          <h1 className="mw-title">Login</h1>
          <p className="mt-1 text-sm text-mw-body">Access your Metra Wealth dashboard.</p>

          <form className="mt-5 grid gap-2" action="/dashboard">
            <label htmlFor="email" className="mw-label">Email</label>
            <input id="email" type="email" placeholder="you@example.com" className="mw-input" />

            <label htmlFor="password" className="mw-label">Password</label>
            <input id="password" type="password" placeholder="Enter your password" className="mw-input" />

            <button type="submit" className="mw-btn-primary mt-3 w-full">Login</button>
          </form>

          <p className="mt-4 text-sm text-mw-body">
            New here?{" "}
            <Link href="/register" className="font-bold text-mw-primary hover:text-mw-light">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
