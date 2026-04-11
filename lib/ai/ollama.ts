import { aiConfig } from "@/lib/ai/config";

type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
};

export async function generateWithOllama(messages: OllamaChatMessage[]) {
  const response = await fetch(`${aiConfig.ollamaBaseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: aiConfig.ollamaModel,
      messages,
      stream: false,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ollama request failed (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = (await response.json()) as OllamaChatResponse;
  const content = data.message?.content?.trim();

  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }

  return content;
}
