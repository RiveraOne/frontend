function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const aiConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-nano",
  maxMessages: parsePositiveInt(process.env.AI_ADVISOR_MAX_MESSAGES, 8),
  maxTransactions: parsePositiveInt(process.env.AI_ADVISOR_MAX_TRANSACTIONS, 100),
};
