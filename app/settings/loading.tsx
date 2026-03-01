function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-mw-border ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <main>
      <section className="mw-shell">
        <div className="mx-auto w-full max-w-2xl">
          {/* Page header */}
          <div className="mw-page-header">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-3.5 w-52 rounded-full" />
            </div>
          </div>

          {/* Profile card */}
          <div className="mw-card overflow-hidden">
            {/* Profile header */}
            <div className="flex items-center gap-4 border-b border-mw-border bg-gradient-to-r from-mw-soft to-white px-6 py-5 dark:to-mw-surface">
              <Skeleton className="h-16 w-16 flex-shrink-0 rounded-2xl" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-40 rounded-full" />
              </div>
            </div>

            {/* Profile rows */}
            <div className="divide-y divide-mw-border">
              {[
                { labelW: "w-20", valueW: "w-32", btnW: "w-12" },
                { labelW: "w-28", valueW: "w-44", btnW: "w-12" },
                { labelW: "w-20", valueW: "w-24", btnW: "w-16" },
                { labelW: "w-24", valueW: "w-16", btnW: "w-20" },
              ].map(({ labelW, valueW, btnW }, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className={`h-3 ${labelW} rounded-full`} />
                    <Skeleton className={`h-4 ${valueW}`} />
                  </div>
                  <Skeleton className={`h-8 ${btnW} rounded-xl`} />
                </div>
              ))}
            </div>
          </div>

          {/* Session card */}
          <div className="mt-5 mw-card overflow-hidden">
            <div className="border-b border-mw-border px-6 py-4">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="px-6 py-4">
              <Skeleton className="mb-1.5 h-3.5 w-full rounded-full" />
              <Skeleton className="mb-3 h-3.5 w-3/4 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>

          {/* Upgrade prompt */}
          <div className="mt-5 rounded-2xl border border-mw-border bg-mw-soft p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-64 rounded-full" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
