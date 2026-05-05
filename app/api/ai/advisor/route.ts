import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import {
  ensureUserDoc,
  resetAdvisorUsageIfNeeded,
  incrementAdvisorUsage,
} from "@/lib/firebase/userDoc";
import { PLAN_CONFIG } from "@/lib/stripe/config";
import { generateAdvisorReply } from "@/lib/ai/advisor";
import type {
  AdvisorMessage,
  AdvisorRequest,
  AdvisorTransaction,
} from "@/lib/ai/types";

export const runtime = "nodejs";

function isValidMessage(value: unknown): value is AdvisorMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

function isValidTransaction(value: unknown): value is AdvisorTransaction {
  if (!value || typeof value !== "object") return false;
  const transaction = value as Record<string, unknown>;
  return (
    typeof transaction.date === "string" &&
    (transaction.type === "Income" || transaction.type === "Expense") &&
    typeof transaction.amount === "number" &&
    Number.isFinite(transaction.amount) &&
    typeof transaction.category === "string" &&
    transaction.category.trim().length > 0
  );
}

function parseAdvisorRequest(body: unknown): AdvisorRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const input = body as Record<string, unknown>;
  const messages = input.messages;
  const transactions = input.transactions;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("`messages` must be a non-empty array.");
  }

  if (!messages.every(isValidMessage)) {
    throw new Error("Each message must include a valid role and content.");
  }

  if (transactions !== undefined) {
    if (!Array.isArray(transactions)) {
      throw new Error("`transactions` must be an array when provided.");
    }
    if (!transactions.every(isValidTransaction)) {
      throw new Error("Each transaction must include date, type, amount, and category.");
    }
  }

  return { messages, transactions };
}

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  let email: string | null;
  let name: string | null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email ?? null;
    name = decoded.name ?? null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── User doc + plan check ─────────────────────────────────────────────────
  let userDoc;
  try {
    userDoc = await ensureUserDoc(uid, email, name);
    userDoc = await resetAdvisorUsageIfNeeded(uid, userDoc);
  } catch (error) {
    console.error("Failed to prepare user doc for advisor", error);
    return NextResponse.json(
      { error: "Could not prepare your account. Please try again." },
      { status: 500 }
    );
  }

  const plan = userDoc.plan;
  const planConfig = PLAN_CONFIG[plan];
  const queriesUsed = userDoc.advisorQueriesUsed;
  const monthlyLimit = planConfig.monthlyLimit;

  if (queriesUsed >= monthlyLimit) {
    return NextResponse.json(
      {
        error: "Monthly query limit reached. Upgrade your plan for more queries.",
        plan,
        queriesUsed,
        monthlyLimit: monthlyLimit === Infinity ? null : monthlyLimit,
      },
      { status: 429 }
    );
  }

  // ── Generate reply ────────────────────────────────────────────────────────
  try {
    const body = await request.json();
    const input = parseAdvisorRequest(body);

    const response = await generateAdvisorReply({
      ...input,
      userProfile: { displayName: name, email, plan },
    });

    await incrementAdvisorUsage(uid);

    const remaining = monthlyLimit === Infinity ? null : monthlyLimit - queriesUsed - 1;

    return NextResponse.json({ ...response, meta: { ...response.meta, queriesRemaining: remaining } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate advisor reply.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
