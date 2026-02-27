import Link from "next/link";
import { mockUser } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <main className="app-shell">
      <section className="app-section narrow">
        <h1>Settings</h1>
        <p className="app-muted">Dummy profile data for MVP UI.</p>

        <div className="settings-list">
          <div>
            <span>Name</span>
            <strong>{mockUser.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{mockUser.email}</strong>
          </div>
          <div>
            <span>Subscription</span>
            <strong>{mockUser.subscription}</strong>
          </div>
        </div>

        <Link href="/" className="btn btn-ghost">
          Logout
        </Link>
      </section>
    </main>
  );
}
