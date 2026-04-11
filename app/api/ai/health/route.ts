import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/config";

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "ollama",
    model: aiConfig.ollamaModel,
    baseUrl: aiConfig.ollamaBaseUrl,
    timestamp: new Date().toISOString(),
  });
}
