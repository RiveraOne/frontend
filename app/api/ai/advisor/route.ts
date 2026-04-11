import { NextResponse } from "next/server";
import { generateAdvisorReply } from "@/lib/ai/advisor";
import type {
  AdvisorMessage,
  AdvisorRequest,
  AdvisorTransaction,
} from "@/lib/ai/types";

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

  return {
    messages,
    transactions,
    userProfile:
      input.userProfile && typeof input.userProfile === "object"
        ? {
            displayName:
              typeof (input.userProfile as Record<string, unknown>).displayName === "string"
                ? ((input.userProfile as Record<string, unknown>).displayName as string)
                : null,
            email:
              typeof (input.userProfile as Record<string, unknown>).email === "string"
                ? ((input.userProfile as Record<string, unknown>).email as string)
                : null,
            plan:
              typeof (input.userProfile as Record<string, unknown>).plan === "string"
                ? ((input.userProfile as Record<string, unknown>).plan as string)
                : null,
          }
        : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseAdvisorRequest(body);

    // TODO: Replace client-supplied transactions with server-side retrieval after
    // adding Firebase Admin auth verification in the dedicated AI backend.
    const response = await generateAdvisorReply(input);

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate advisor reply.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 }
    );
  }
}
