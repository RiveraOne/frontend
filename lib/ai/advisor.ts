import { aiConfig } from "@/lib/ai/config";
import { generateWithOllama } from "@/lib/ai/ollama";
import { buildConversation, buildAdvisorSystemPrompt } from "@/lib/ai/prompt";
import { buildFinancialSummary } from "@/lib/ai/summary";
import type { AdvisorRequest, AdvisorResponse } from "@/lib/ai/types";

export async function generateAdvisorReply(
  input: AdvisorRequest
): Promise<AdvisorResponse> {
  const summary = buildFinancialSummary(input.transactions || []);
  const conversation = buildConversation(input.messages).slice(-aiConfig.maxMessages);

  const content = await generateWithOllama([
    {
      role: "system",
      content: buildAdvisorSystemPrompt({
        userProfile: input.userProfile,
        summary,
      }),
    },
    ...conversation,
  ]);

  return {
    reply: {
      role: "assistant",
      content,
    },
    meta: {
      provider: "ollama",
      model: aiConfig.ollamaModel,
      transactionCount: summary.transactionCount,
      generatedAt: new Date().toISOString(),
      summary,
    },
  };
}
