"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import PlanProtectedRoute from "@/components/auth/plan-protected-route";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_CONFIG } from "@/lib/stripe/config";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function InlineMd({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2] !== undefined) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      parts.push(<em key={key++}>{match[3]}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ol" | "ul" | null = null;

  function flushList() {
    if (!listItems.length) return;
    const Tag = listType!;
    nodes.push(
      <Tag key={nodes.length} className={Tag === "ol" ? "ml-4 list-decimal space-y-1" : "ml-4 list-disc space-y-1"}>
        {listItems.map((item, i) => (
          <li key={i}><InlineMd text={item} /></li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    const numberedMatch = line.match(/^\d+\.\s+(.*)/);
    const bulletMatch = line.match(/^[-•]\s+(.*)/);
    if (numberedMatch) {
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(numberedMatch[1]);
    } else if (bulletMatch) {
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(bulletMatch[1]);
    } else {
      flushList();
      nodes.push(<p key={nodes.length}><InlineMd text={line} /></p>);
    }
  }
  flushList();
  return <div className="space-y-2">{nodes}</div>;
}

const SUGGESTIONS = [
  "Can I afford a $300 purchase?",
  "How should I start saving?",
  "How do I pay off debt faster?",
  "Where should I cut expenses?",
];

export default function AdvisorPage() {
  const { user, userDoc } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI financial advisor. Ask me anything about your money — budgeting, saving, spending decisions, or debt.",
    },
  ]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  const plan = userDoc?.plan ?? "free";
  const planConfig = PLAN_CONFIG[plan];
  const queriesUsed = userDoc?.advisorQueriesUsed ?? 0;
  const monthlyLimit = planConfig.monthlyLimit;
  const isUnlimited = monthlyLimit === Infinity;
  const isAtLimit = !isUnlimited && queriesUsed >= monthlyLimit;
  const remaining = isUnlimited ? null : Math.max(0, monthlyLimit - queriesUsed);
  const usagePercent = isUnlimited ? 0 : Math.min(100, Math.round((queriesUsed / monthlyLimit) * 100));

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, isTyping]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = query.trim();
    if (!prompt || isAtLimit || !user || isTyping) return;

    const nextMessages = [...messages, { role: "user" as const, content: prompt }];
    setMessages(nextMessages);
    setQuery("");
    setError("");
    setIsTyping(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json() as {
        reply?: ChatMessage;
        error?: string;
        plan?: string;
        queriesUsed?: number;
        monthlyLimit?: number | null;
      };

      if (response.status === 429) {
        setError(data.error ?? "Monthly query limit reached. Upgrade your plan for more queries.");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "You've reached your monthly query limit. Upgrade your plan to continue." },
        ]);
        return;
      }

      if (!response.ok || !data.reply?.content) {
        throw new Error(data.error ?? "Failed to generate a response.");
      }

      setMessages((prev) => [...prev, data.reply!]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reach the AI service.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't generate a response right now. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function onSuggestion(suggestion: string) {
    setQuery(suggestion);
    inputRef.current?.focus();
  }

  return (
    <PlanProtectedRoute>
      <main>
        <section className="mw-shell">
          <div className="mx-auto flex w-full max-w-2xl flex-col" style={{ height: "calc(100vh - 10rem)" }}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mw-section-label mb-0.5">AI</p>
                <h1 className="mw-title">Financial Advisor</h1>
                <p className="mt-1 text-sm text-mw-body">Ask money questions and get instant guidance.</p>
              </div>

              <div className="mw-card flex items-center gap-3 px-4 py-2.5">
                {isUnlimited ? (
                  <div>
                    <p className="text-xs font-bold text-mw-primary">Unlimited queries</p>
                    <p className="mt-0.5 text-xs text-mw-body capitalize">{planConfig.label} plan</p>
                  </div>
                ) : (
                  <div>
                    <p className={`text-xs font-bold ${isAtLimit ? "text-rose-500" : "text-mw-primary"}`}>
                      {remaining} {remaining === 1 ? "query" : "queries"} left this month
                    </p>
                    <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-mw-border">
                      <div
                        className={`h-full rounded-full transition-all ${usagePercent >= 80 ? "bg-rose-400" : "bg-gradient-to-r from-mw-accent to-mw-primary"}`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                )}
                <span className="text-xs text-mw-body">{isUnlimited ? "∞" : `${queriesUsed}/${monthlyLimit}`}</span>
              </div>
            </div>

            <div className="mw-card flex flex-1 flex-col overflow-hidden">
              <div ref={messagesContainerRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        message.role === "user"
                          ? "bg-mw-primary text-white"
                          : "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                      }`}
                    >
                      {message.role === "user" ? "Y" : "AI"}
                    </div>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "rounded-tr-sm bg-mw-primary text-white"
                          : "rounded-tl-sm border border-mw-border bg-mw-soft text-mw-dark"
                      }`}
                    >
                      {message.role === "user" ? message.content : <MessageContent content={message.content} />}
                    </div>
                  </div>
                ))}

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
                            className="h-2 w-2 animate-bounce rounded-full bg-mw-light"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {messages.length === 1 && !isTyping && (
                <div className="border-t border-mw-border px-4 py-3">
                  <p className="mb-2 text-xs font-semibold text-mw-light">Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => onSuggestion(suggestion)}
                        className="rounded-full border border-mw-border bg-mw-soft px-3 py-1 text-xs font-semibold text-mw-primary transition-colors hover:border-mw-accent"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-mw-border p-4">
                {error && (
                  <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    {error}
                  </div>
                )}

                {isAtLimit ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    <p className="font-semibold">Monthly query limit reached.</p>
                    <p className="mt-0.5 text-xs">
                      <a href="/pricing" className="underline underline-offset-2">Upgrade your plan</a> for more AI advisor access.
                    </p>
                  </div>
                ) : (
                  <form className="flex gap-2" onSubmit={onSubmit}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask a money question..."
                      className="mw-input flex-1"
                      disabled={isTyping}
                    />
                    <button
                      className="mw-btn-primary flex-shrink-0 px-5 disabled:opacity-50"
                      type="submit"
                      disabled={!query.trim() || isTyping}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
    </PlanProtectedRoute>
  );
}
