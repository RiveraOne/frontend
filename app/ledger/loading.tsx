function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-mw-border ${className}`} />;
}

export default function LedgerLoading() {
  return (
    <main>
      <section className="mw-shell">
        {/* Page header */}
        <div className="mw-page-header">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-3.5 w-48 rounded-full" />
          </div>
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>

        {/* Summary stats */}
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {["border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/30",
            "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30",
            "border-mw-border bg-mw-soft",
          ].map((cls, i) => (
            <div key={i} className={`rounded-xl border px-4 py-3 ${cls}`}>
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="mt-2 h-7 w-24" />
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="mw-card overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mw-border px-5 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36 rounded-xl" />
          </div>

          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-mw-border bg-mw-soft">
                  {["Date", "Type", "Category", "Amount"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left">
                      <Skeleton className="h-3 w-16 rounded-full" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className={`border-b border-mw-border/50 ${i % 2 !== 0 ? "bg-mw-soft/40" : ""}`}>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-3.5 w-24 rounded-full" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-3.5 w-28" />
                    </td>
                    <td className="px-5 py-3.5 flex justify-end">
                      <Skeleton className="h-3.5 w-16 rounded-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
