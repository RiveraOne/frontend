export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-12 w-12 animate-ping rounded-full bg-mw-accent opacity-20" />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mw-border border-t-mw-accent" />
        </div>
        <p className="text-sm font-semibold text-mw-light animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
