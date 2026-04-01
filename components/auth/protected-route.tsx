"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || user) return;

    const query = searchParams.toString();
    const redirectTo = query ? `${pathname}?${query}` : pathname;
    router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }, [loading, pathname, router, searchParams, user]);

  if (loading || !user) {
    return (
      <main>
        <section className="mw-shell">
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <div className="h-8 w-40 animate-pulse rounded-xl bg-mw-border" />
            <div className="mw-card h-48 animate-pulse bg-mw-soft" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="mw-card h-28 animate-pulse bg-mw-soft" />
              <div className="mw-card h-28 animate-pulse bg-mw-soft" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
