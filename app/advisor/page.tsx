"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

function getMockResponse(input: string): string {
  const text = input.toLowerCase();

  if (text.includes("can i afford") || text.includes("afford")) {
    return "Based on your current balance, this appears manageable.";
  }

  if (text.includes("save") || text.includes("saving")) {
    return "A simple start is to auto-move a fixed amount to savings right after income hits.";
  }

  if (text.includes("debt")) {
    return "Focus on highest-interest debt first while maintaining minimum payments on others.";
  }

  return "I recommend reviewing your last 30 days of spending before making this decision.";
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi, I am your mock advisor. Ask a money question to get a demo response."
    }
  ]);
  const [query, setQuery] = useState("");
  const [used, setUsed] = useState(0);

  const usageLabel = useMemo(() => `${used}/5 free queries used`, [used]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prompt = query.trim();
    if (!prompt) {
      return;
    }

    const response = getMockResponse(prompt);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: prompt },
      { role: "assistant", text: response }
    ]);
    setQuery("");
    setUsed((prev) => Math.min(prev + 1, 5));
  };

  return (
    <main>
      <section className="mw-shell">
        <div className="mw-card mx-auto w-full max-w-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="mw-title">AI Advisor</h1>
            <span className="rounded-full border border-[#d3f0eb] bg-[#eefaf8] px-3 py-1 text-xs font-bold text-[#05655a]">
              {usageLabel}
            </span>
          </div>

          <div className="mt-4 grid max-h-[420px] min-h-[280px] gap-2 overflow-y-auto rounded-xl border border-mw-border bg-[#fbfefe] p-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[82%] rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-mw-primary text-white"
                    : "bg-[#e9f8f6] text-mw-dark"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form className="mt-3 flex gap-2 max-sm:flex-col" onSubmit={onSubmit}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask: Can I afford 200?"
              className="mw-input"
            />
            <button className="mw-btn-primary" type="submit">
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
