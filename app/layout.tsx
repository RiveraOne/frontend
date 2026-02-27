import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metra Wealth - Pricing",
  description: "Pricing plans for Metra Wealth"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body>
        <header className="site-nav">
          <div className="site-nav-inner">
            <div className="site-nav-left">
              <Link href="/" className="site-logo">
                <span className="site-logo-mark" />
                <span className="site-logo-text">Metra Wealth</span>
              </Link>
              <nav className="site-nav-links" aria-label="Primary">
                <Link href="/">Home</Link>
                <Link href="/pricing">Pricing</Link>
              </nav>
            </div>
            <div className="site-nav-actions">
              <Link href="/login" className="btn btn-ghost btn-nav">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary btn-nav">
                Get Started
              </Link>
            </div>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="site-footer-inner">
            <div className="site-footer-brand">
              <div className="site-logo">
                <span className="site-logo-mark" />
                <span className="site-logo-text">Metra Wealth</span>
              </div>
              <p>
                Better decisions before you spend. Build healthy financial systems with confidence.
              </p>
            </div>
            <div className="site-footer-links">
              <div>
                <h4>Product</h4>
                <Link href="/">Home</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/dashboard">Dashboard</Link>
              </div>
              <div>
                <h4>Account</h4>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
                <Link href="/settings">Settings</Link>
              </div>
            </div>
          </div>
          <div className="site-footer-bottom">
            <span>© {year} Metra Wealth</span>
            <span className="site-footer-legal">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </span>
            <span>Not financial advice</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
