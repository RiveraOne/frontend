function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-mw-border ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main>
      <section className="mw-shell">
        {/* Page header */}
        <div className="mw-page-header">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-3.5 w-40 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            "border-l-teal-400",
            "border-l-rose-400",
            "border-l-mw-accent",
          ].map((border, i) => (
            <article key={i} className={`mw-stat-card border-l-4 ${border}`}>
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-9 w-32" />
              <Skeleton className="h-3 w-28 rounded-full" />
            </article>
          ))}
        </div>

        {/* Budget bar card */}
        <div className="mt-4 mw-card p-5">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
          <div className="mt-2 flex justify-between">
            <Skeleton className="h-3 w-6 rounded-full" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6">
          <Skeleton className="mb-3 h-3 w-24 rounded-full" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="mw-card flex items-start gap-3 p-4">
                <Skeleton className="mt-0.5 h-9 w-9 flex-shrink-0 rounded-xl" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-3 w-36 rounded-full" />
            <Skeleton className="h-3 w-14 rounded-full" />
          </div>
          <div className="mw-card divide-y divide-mw-border overflow-hidden">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 flex-shrink-0 rounded-lg" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
