"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";

type PlanProtectedRouteProps = {
  children: ReactNode;
};

export default function PlanProtectedRoute({ children }: PlanProtectedRouteProps) {
  const router = useRouter();
  const { user, userDoc, userDocLoading } = useAuth();
  const hasPaidPlan = userDoc?.plan === "essential" || userDoc?.plan === "pro";

  useEffect(() => {
    if (!user || userDocLoading || hasPaidPlan) return;
    router.replace("/pricing?reason=advisor");
  }, [hasPaidPlan, router, user, userDocLoading]);

  return (
    <ProtectedRoute>
      {userDocLoading ? (
        <main>
          <section className="mw-shell">
            <div className="mx-auto w-full max-w-2xl space-y-4">
              <div className="h-8 w-40 animate-pulse rounded-xl bg-mw-border" />
              <div className="mw-card h-48 animate-pulse bg-mw-soft" />
            </div>
          </section>
        </main>
      ) : hasPaidPlan ? (
        children
      ) : (
        <main>
          <section className="mw-shell">
            <div className="mx-auto w-full max-w-2xl rounded-xl border border-mw-accent/30 bg-mw-soft px-5 py-4 text-sm text-mw-body">
              <p className="font-semibold text-mw-primary">Choose a plan to unlock the AI Advisor.</p>
              <Link href="/pricing" className="mt-3 inline-flex mw-btn-primary">
                View Pricing
              </Link>
            </div>
          </section>
        </main>
      )}
    </ProtectedRoute>
  );
}
