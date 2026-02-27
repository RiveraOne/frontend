import Link from "next/link";
import { mockUser } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <main>
      <section className="mw-shell">
        <div className="mw-card mx-auto w-full max-w-3xl p-6">
          <h1 className="mw-title">Settings</h1>
          <p className="mt-1 text-sm text-mw-body">Dummy profile data for MVP UI.</p>

          <div className="mt-4 overflow-hidden rounded-xl border border-mw-border">
            <div className="flex justify-between gap-2 border-b border-mw-border px-4 py-3 text-sm">
              <span className="text-mw-light">Name</span>
              <strong className="text-mw-primary">{mockUser.name}</strong>
            </div>
            <div className="flex justify-between gap-2 border-b border-mw-border px-4 py-3 text-sm">
              <span className="text-mw-light">Email</span>
              <strong className="text-mw-primary">{mockUser.email}</strong>
            </div>
            <div className="flex justify-between gap-2 px-4 py-3 text-sm">
              <span className="text-mw-light">Subscription</span>
              <strong className="text-mw-primary">{mockUser.subscription}</strong>
            </div>
          </div>

          <Link href="/" className="mw-btn-ghost mt-4">Logout</Link>
        </div>
      </section>
    </main>
  );
}
