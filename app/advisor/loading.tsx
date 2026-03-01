function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-mw-border ${className}`} />;
}

export default function AdvisorLoading() {
  return (
    <main>
      <section className="mw-shell">
        <div className="mx-auto flex w-full max-w-2xl flex-col" style={{ height: "calc(100vh - 10rem)" }}>
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-8 rounded-full" />
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-3.5 w-64 rounded-full" />
            </div>
            {/* Usage badge */}
            <div className="mw-card flex items-center gap-3 px-4 py-2.5">
              <div>
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="mt-1.5 h-1.5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-3 w-8 rounded-full" />
            </div>
          </div>

          {/* Chat window */}
          <div className="mw-card flex flex-1 flex-col overflow-hidden">
            {/* Messages area */}
            <div className="flex-1 p-4 space-y-3">
              {/* Assistant message */}
              <div className="flex gap-2.5">
                <Skeleton className="h-7 w-7 flex-shrink-0 rounded-full" />
                <Skeleton className="h-14 w-72 rounded-2xl rounded-tl-sm" />
              </div>

              {/* Suggestion pills placeholder */}
              <div className="border-t border-mw-border pt-3 mt-3">
                <Skeleton className="mb-2 h-3 w-20 rounded-full" />
                <div className="flex flex-wrap gap-1.5">
                  {[96, 80, 88, 76].map((w, i) => (
                    <Skeleton key={i} className={`h-6 w-${w} rounded-full`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-mw-border p-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-20 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
