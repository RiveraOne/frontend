import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { ensureUserDoc } from "@/lib/firebase/userDoc";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    await ensureUserDoc(decoded.uid, decoded.email ?? null, decoded.name ?? null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
