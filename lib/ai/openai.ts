import OpenAI from "openai";
import { aiConfig } from "@/lib/ai/config";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

let _client: OpenAI | null = null;

function getClient() {
  if (!_client) {
    if (!aiConfig.openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set.");
    }
    _client = new OpenAI({ apiKey: aiConfig.openaiApiKey });
  }
  return _client;
}

export async function generateWithOpenAI(messages: ChatMessage[]) {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: aiConfig.openaiModel,
    messages,
  });

  const content = completion.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content;
}
