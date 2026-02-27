"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

function getMockResponse(input: string): string {
  const text = input.toLowerCase();

  if (text.includes("can i afford") || text.includes("afford")) {
    return "Based on your current balance, this appears manageable. Make sure to account for upcoming fixed expenses before committing.";
  }

  if (text.includes("save") || text.includes("saving")) {
    return "A simple start is to auto-move a fixed amount to savings right after income hits — before you have a chance to spend it.";
  }

  if (text.includes("debt")) {
    return "Focus on highest-interest debt first while maintaining minimum payments on others. This is the avalanche method and saves the most money long-term.";
  }

  return "I recommend reviewing your last 30 days of spending before making this decision. Look for patterns in discretionary categories like dining and subscriptions.";
}

const SUGGESTIONS = [
  "Can I afford a $300 purchase?",
  "How should I start saving?",
  "How do I pay off debt faster?",
  "Where should I cut expenses?",
];

const MAX_FREE = 5;

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi! I'm your AI financial advisor. Ask me anything about your money — budgeting, saving, spending decisions, or debt.",
    },
  ]);
  const [query, setQuery] = useState("");
  const [used, setUsed] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_FREE - used;
  const isAtLimit = used >= MAX_FREE;
  const usagePercent = Math.round((used / MAX_FREE) * 100);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = query.trim();
    if (!prompt || isAtLimit) return;

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getMockResponse(prompt);
      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
      setIsTyping(false);
      setUsed((prev) => Math.min(prev + 1, MAX_FREE));
    }, 800);
  };

  const onSuggestion = (s: string) => {
    setQuery(s);
    inputRef.current?.focus();
  };

  return (
    <main>
      <section className="mw-shell">
        <div className="mx-auto flex w-full max-w-2xl flex-col" style={{ height: "calc(100vh - 10rem)" }}>
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mw-section-label mb-0.5">AI</p>
              <h1 className="mw-title">Financial Advisor</h1>
              <p className="mt-1 text-sm text-mw-body">Ask money questions and get instant guidance.</p>
            </div>

            {/* Usage badge */}
            <div className="mw-card flex items-center gap-3 px-4 py-2.5">
              <div>
                <p className="text-xs font-bold text-mw-primary">
                  {remaining} free {remaining === 1 ? "query" : "queries"} left
                </p>
                <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-mw-border">
                  <div
                    className={`h-full rounded-full transition-all ${usagePercent >= 80 ? "bg-rose-400" : "bg-gradient-to-r from-mw-accent to-mw-primary"}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-mw-body">{used}/{MAX_FREE}</span>
            </div>
          </div>

          {/* Chat window */}
          <div className="mw-card flex flex-1 flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    message.role === "user"
                      ? "bg-mw-primary text-white"
                      : "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                  }`}>
                    {message.role === "user" ? "Y" : "AI"}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-mw-primary text-white"
                      : "rounded-tl-sm bg-mw-soft text-mw-dark border border-mw-border"
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                    AI
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-mw-border bg-mw-soft px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-mw-light animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (only show at start) */}
            {messages.length === 1 && !isTyping && (
              <div className="border-t border-mw-border px-4 py-3">
                <p className="mb-2 text-xs font-semibold text-mw-light">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onSuggestion(s)}
                      className="rounded-full border border-mw-border bg-mw-soft px-3 py-1 text-xs font-semibold text-mw-primary hover:border-mw-accent transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-mw-border p-4">
              {isAtLimit ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                  <p className="font-semibold">Free query limit reached.</p>
                  <p className="mt-0.5 text-xs">Upgrade to Pro for unlimited AI advisor access.</p>
                </div>
              ) : (
                <form className="flex gap-2" onSubmit={onSubmit}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a money question…"
                    className="mw-input flex-1"
                    disabled={isTyping}
                  />
                  <button
                    className="mw-btn-primary flex-shrink-0 px-5 disabled:opacity-50"
                    type="submit"
                    disabled={!query.trim() || isTyping}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
