"use client";

const TICKER_ITEMS = [
  "Practical planning",
  "Clean dashboard",
  "Decision-first workflow",
  "Designed for consistency",
  "Privacy first",
  "AI-powered insights",
  "Bank-grade security",
];

export default function TickerMarquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="border-y border-mw-border bg-mw-soft overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-4">
        {items.map((item, i) => (
          <div key={i} className="mx-8 flex flex-shrink-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-mw-accent" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-mw-light">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
