import { describe, expect, it } from "vitest";
import { readJson } from "@/app/api/__test-helpers__";

describe("GET /api/ai/health", () => {
  it("returns ok with provider, model, and an ISO timestamp", async () => {
    const { GET } = await import("./route");
    const res = await GET();

    expect(res.status).toBe(200);
    const body = await readJson<{
      ok: boolean;
      provider: string;
      model: string;
      timestamp: string;
    }>(res);

    expect(body.ok).toBe(true);
    expect(body.provider).toBe("openai");
    expect(typeof body.model).toBe("string");
    expect(body.model.length).toBeGreaterThan(0);
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("uses aiConfig.openaiModel for the model field", async () => {
    const { GET } = await import("./route");
    const { aiConfig } = await import("@/lib/ai/config");
    const res = await GET();
    const body = await readJson<{ model: string }>(res);
    expect(body.model).toBe(aiConfig.openaiModel);
  });
});
