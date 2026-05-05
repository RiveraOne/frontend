import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/config";

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "openai",
    model: aiConfig.openaiModel,
    timestamp: new Date().toISOString(),
  });
}
