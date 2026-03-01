function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-mw-border ${className}`} />;
}

export default function TransactionDetailLoading() {
  return (
    <main>
      <section className="mw-shell">
        <div className="mx-auto w-full max-w-2xl">
          {/* Back link */}
          <Skeleton className="mb-5 h-4 w-28 rounded-full" />

          {/* Main card */}
          <div className="mw-card overflow-hidden">
            {/* Card header */}
            <div className="border-b border-mw-border bg-mw-soft px-6 py-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-7 w-36" />
                  <Skeleton className="h-3.5 w-44 rounded-full" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Details rows */}
            <div className="divide-y divide-mw-border">
              {[
                { labelW: "w-28", valueW: "w-20" },
                { labelW: "w-12", valueW: "w-28" },
                { labelW: "w-20", valueW: "w-24" },
                { labelW: "w-12", valueW: "w-16" },
                { labelW: "w-16", valueW: "w-20" },
              ].map(({ labelW, valueW }, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <Skeleton className={`h-3 ${labelW} rounded-full`} />
                  <Skeleton className={`h-4 ${valueW}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Context stat cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="mw-card p-5">
                <Skeleton className="mb-2 h-3 w-24 rounded-full" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="mt-2 h-3 w-full rounded-full" />
                {i === 1 && <Skeleton className="mt-2 h-1.5 w-full rounded-full" />}
              </div>
            ))}
          </div>

          {/* Related transactions */}
          <div className="mt-4">
            <Skeleton className="mb-3 h-3 w-40 rounded-full" />
            <div className="mw-card divide-y divide-mw-border overflow-hidden">
              {[0, 1].map((i) => (
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

          {/* Action buttons */}
          <div className="mt-5 flex gap-3">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-40 rounded-xl" />
          </div>
        </div>
      </section>
    </main>
  );
}
