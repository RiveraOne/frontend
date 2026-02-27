import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="bg-gradient-to-b from-[#f5fbfa] to-white">
      <section className="mw-shell grid place-items-center">
        <div className="mw-card w-full max-w-md p-7">
          <h1 className="mw-title">Register</h1>
          <p className="mt-1 text-sm text-mw-body">Create your Metra Wealth account.</p>

          <form className="mt-5 grid gap-2" action="/dashboard">
            <label htmlFor="name" className="mw-label">Full name</label>
            <input id="name" type="text" placeholder="Your name" className="mw-input" />

            <label htmlFor="email" className="mw-label">Email</label>
            <input id="email" type="email" placeholder="you@example.com" className="mw-input" />

            <label htmlFor="password" className="mw-label">Password</label>
            <input id="password" type="password" placeholder="Create a password" className="mw-input" />

            <button type="submit" className="mw-btn-primary mt-3 w-full">Register</button>
          </form>

          <p className="mt-4 text-sm text-mw-body">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-mw-primary hover:text-mw-light">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
