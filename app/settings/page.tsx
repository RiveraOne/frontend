"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateProfile } from "firebase/auth";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { auth, logout, resetPassword } from "@/lib/firebase";
import { PLAN_CONFIG } from "@/lib/stripe/config";
import { hasPaidAdvisorAccess } from "@/lib/auth/entitlements";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "1";
  const { user, loading, userDoc, userDocLoading } = useAuth();

  // ── Name editing ────────────────────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  function startEditName() {
    setNameValue(user?.displayName ?? "");
    setNameError("");
    setEditingName(true);
  }

  async function saveName() {
    if (!user || !nameValue.trim()) return;
    setNameSaving(true);
    setNameError("");
    try {
      await updateProfile(user, { displayName: nameValue.trim() });
      // Force a token refresh so useAuth picks up the new displayName
      await auth.currentUser?.reload();
      setEditingName(false);
    } catch {
      setNameError("Failed to update name. Please try again.");
    } finally {
      setNameSaving(false);
    }
  }

  // ── Password reset ───────────────────────────────────────────────────────────
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordSending, setPasswordSending] = useState(false);

  async function handlePasswordReset() {
    if (!user?.email) return;
    setPasswordSending(true);
    setPasswordMsg("");
    try {
      await resetPassword(user.email);
      setPasswordMsg("Reset link sent — check your inbox.");
    } catch {
      setPasswordMsg("Failed to send reset email. Try again.");
    } finally {
      setPasswordSending(false);
    }
  }

  // ── Sign out ─────────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await logout();
    router.push("/");
  }

  // ── Derived values ───────────────────────────────────────────────────────────
  const name = user?.displayName ?? "";
  const email = user?.email ?? "";
  const photoURL = user?.photoURL ?? null;

  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : email.slice(0, 2).toUpperCase();

  // ── Theme ────────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>("light");
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved: Theme = stored === "dark" || (!stored && systemPrefersDark) ? "dark" : "light";
    setTheme(resolved);
    setThemeMounted(true);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  // ── Billing portal ───────────────────────────────────────────────────────────
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  async function handleManageBilling() {
    if (!user) return;
    setPortalLoading(true);
    setPortalError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(data.error ?? "Could not open billing portal. Please try again.");
      }
    } catch {
      setPortalError("Could not connect. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  // ── Plan / subscription ──────────────────────────────────────────────────────
  const plan = userDoc?.plan ?? "free";
  const planConfig = PLAN_CONFIG[plan];
  const isPro = plan === "pro";
  const isFree = plan === "free";
  const canUseAdvisor = hasPaidAdvisorAccess(userDoc);
  const subscriptionStatus = userDoc?.subscriptionStatus;
  const statusSuffix =
    !isFree && subscriptionStatus && subscriptionStatus !== "active"
      ? ` (${subscriptionStatus.replace(/_/g, " ")})`
      : "";
  const subscriptionLabel = `${planConfig.label} Plan${statusSuffix}`;
  const queriesUsed = userDoc?.advisorQueriesUsed ?? 0;
  const monthlyLimit = planConfig.monthlyLimit;
  const isUnlimited = monthlyLimit === Infinity;
  const usagePercent = isUnlimited ? 0 : Math.min(100, Math.round((queriesUsed / monthlyLimit) * 100));
  const advisorUsageLabel = isFree
    ? <span className="font-semibold text-mw-body">Upgrade to unlock</span>
    : !canUseAdvisor
      ? <span className="font-semibold text-rose-600">Inactive until subscription is active</span>
      : isUnlimited
        ? <span className="font-semibold text-mw-primary">Unlimited queries</span>
        : <span className="font-semibold text-mw-primary">{queriesUsed} / {monthlyLimit} queries used this month</span>;

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading || userDocLoading) {
    return (
      <main>
        <section className="mw-shell">
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <div className="h-8 w-40 animate-pulse rounded-xl bg-mw-border" />
            <div className="mw-card h-48 animate-pulse bg-mw-soft" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <ProtectedRoute>
    <main>
      <section className="mw-shell">
        <div className="mx-auto w-full max-w-2xl">
          {/* Upgrade success banner */}
          {upgraded && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="text-base">🎉</span>
              <span className="font-semibold">You&apos;re now on the {userDoc?.plan === "pro" ? "Pro" : "Essential"} plan — welcome aboard!</span>
            </div>
          )}

          {/* Page header */}
          <div className="mw-page-header">
            <div>
              <p className="mw-section-label mb-0.5">Account</p>
              <h1 className="mw-title">Settings</h1>
              <p className="mt-1 text-sm text-mw-body">Manage your profile and preferences.</p>
            </div>
          </div>

          {/* Profile card */}
          <div className="mw-card overflow-hidden">
            {/* Profile header */}
            <div className="flex items-center gap-4 border-b border-mw-border bg-gradient-to-r from-mw-soft to-white px-6 py-5 dark:to-mw-surface">
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoURL}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover shadow-md"
                />
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mw-accent to-mw-primary text-xl font-black text-white shadow-md">
                  {initials}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-black text-mw-primary">{name || email}</p>
                  {isPro ? (
                    <span className="mw-badge-pro">Pro</span>
                  ) : plan === "essential" ? (
                    <span className="mw-badge border border-mw-accent/40 bg-mw-accent/10 text-mw-accent">Essential</span>
                  ) : (
                    <span className="mw-badge border border-mw-border bg-mw-soft text-mw-light">Free</span>
                  )}
                </div>
                <p className="text-sm text-mw-body">{email}</p>
              </div>
            </div>

            {/* Profile details */}
            <div className="divide-y divide-mw-border">
              {/* Full name */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Full Name</p>
                  {editingName ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                        className="mw-input h-8 flex-1 text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveName}
                        disabled={nameSaving}
                        className="mw-btn-primary h-8 px-3 text-xs disabled:opacity-60"
                      >
                        {nameSaving ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingName(false)}
                        className="mw-btn-ghost h-8 px-3 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm font-semibold text-mw-dark">{name || "—"}</p>
                  )}
                  {nameError && <p className="mt-1 text-xs text-rose-600">{nameError}</p>}
                </div>
                {!editingName && (
                  <button type="button" onClick={startEditName} className="mw-btn-ghost py-1.5 text-xs">
                    Edit
                  </button>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Email Address</p>
                  <p className="mt-0.5 text-sm font-semibold text-mw-dark">{email}</p>
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Password</p>
                  <p className="mt-0.5 text-sm text-mw-body">••••••••••</p>
                  {passwordMsg && (
                    <p className={`mt-1 text-xs ${passwordMsg.includes("Failed") ? "text-rose-600" : "text-teal-600"}`}>
                      {passwordMsg}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={passwordSending}
                  className="mw-btn-ghost py-1.5 text-xs disabled:opacity-60"
                >
                  {passwordSending ? "Sending…" : "Change"}
                </button>
              </div>

              {/* Subscription */}
              <div className="flex items-start justify-between gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Subscription</p>
                  <p className="mt-0.5 text-sm font-semibold text-mw-dark">{subscriptionLabel}</p>
                  {/* AI advisor usage */}
                  <div className="mt-2">
                    <p className="text-xs text-mw-body">
                      AI Advisor: {advisorUsageLabel}
                    </p>
                    {canUseAdvisor && !isUnlimited && (
                      <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-mw-border">
                        <div
                          className={`h-full rounded-full transition-all ${usagePercent >= 80 ? "bg-rose-400" : "bg-gradient-to-r from-mw-accent to-mw-primary"}`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {!isFree && (
                    <>
                      <button
                        type="button"
                        onClick={handleManageBilling}
                        disabled={portalLoading}
                        className="mw-btn-ghost py-1.5 text-xs disabled:opacity-60"
                      >
                        {portalLoading ? "Loading…" : "Manage Billing"}
                      </button>
                      {portalError && (
                        <p className="text-right text-xs text-rose-600">{portalError}</p>
                      )}
                    </>
                  )}
                  {isFree && (
                    <Link href="/pricing" className="mw-btn-primary py-1.5 text-xs">
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="mt-5 mw-card overflow-hidden">
            <div className="border-b border-mw-border px-6 py-4">
              <p className="text-sm font-bold text-mw-primary">Appearance</p>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-mw-light">Theme</p>
                <p className="mt-0.5 text-sm font-semibold text-mw-dark">
                  {themeMounted ? (theme === "dark" ? "Dark" : "Light") : "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-mw-accent focus:ring-offset-2 ${
                  themeMounted && theme === "dark"
                    ? "bg-mw-accent"
                    : "bg-mw-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    themeMounted && theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="mt-5 mw-card overflow-hidden">
            <div className="border-b border-mw-border px-6 py-4">
              <p className="text-sm font-bold text-mw-primary">Session</p>
            </div>
            <div className="px-6 py-4">
              <p className="mb-3 text-sm text-mw-body">
                Signing out will end your current session. Your data will remain saved.
              </p>
              <button type="button" onClick={handleSignOut} className="mw-btn-danger">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          {/* Plan upgrade prompt */}
          {isFree && (
            <div className="mt-5 rounded-2xl border border-mw-accent/30 bg-gradient-to-r from-teal-50 to-white p-5 dark:from-teal-950/20 dark:to-mw-surface">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-mw-primary">Unlock Pro features</p>
                  <p className="mt-0.5 text-xs text-mw-body">
                    Unlimited AI queries, advanced insights, and smart budget rules.
                  </p>
                </div>
                <Link href="/pricing" className="mw-btn-primary text-sm">
                  View Plans →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
    </ProtectedRoute>
  );
}
