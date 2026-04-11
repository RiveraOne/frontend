function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const aiConfig = {
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "gemma3:4b",
  maxMessages: parsePositiveInt(process.env.AI_ADVISOR_MAX_MESSAGES, 8),
  maxTransactions: parsePositiveInt(process.env.AI_ADVISOR_MAX_TRANSACTIONS, 100),
};
