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
    <main className="app-shell">
      <section className="app-section narrow">
        <div className="section-head">
          <h1>AI Advisor</h1>
          <span className="usage-pill">{usageLabel}</span>
        </div>

        <div className="chat-box">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`bubble ${message.role}`}>
              {message.text}
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={onSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask: Can I afford 200?"
          />
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
