import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMON_SIGNING_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = (payload.meta as Record<string, unknown>)?.event_name as string;
  if (eventName !== "order_created") {
    return NextResponse.json({ ok: true });
  }

  const meta = payload.meta as Record<string, unknown>;
  const customData = (meta?.custom_data as Record<string, unknown>) ?? {};
  const planType = customData.plan_type as string; // 'monthly' | 'lifetime'
  const customUserId = customData.user_id as string | undefined;

  const data = payload.data as Record<string, unknown>;
  const attrs = data?.attributes as Record<string, unknown>;
  const userEmail = attrs?.user_email as string;
  const orderId = (data?.id as string) ?? String(Date.now());
  const totalCents = Number(attrs?.total ?? 0);

  if (!planType || (!customUserId && !userEmail)) {
    return NextResponse.json({ error: "Missing plan_type or user identity" }, { status: 400 });
  }

  const db = await getDb();
  // Prefer the logged-in user's id (captured at checkout); fall back to the
  // email typed into the Lemon Squeezy checkout, which may differ.
  let user = customUserId
    ? (await db.execute({
        sql: "SELECT id FROM users WHERE id = ?",
        args: [customUserId],
      })).rows[0] as unknown as { id: string } | undefined
    : undefined;

  if (!user && userEmail) {
    user = (await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [userEmail],
    })).rows[0] as unknown as { id: string } | undefined;
  }

  if (!user) {
    console.warn("[lemon webhook] No user found for", customUserId ?? userEmail);
    return NextResponse.json({ ok: true });
  }

  const planExpiresAt = planType === "monthly" ? Date.now() + 31 * 24 * 60 * 60 * 1000 : null;

  await db.execute({
    sql: "UPDATE users SET plan = 'pro', plan_expires_at = ? WHERE id = ?",
    args: [planExpiresAt, user.id],
  });

  try {
    await db.execute({
      sql: "INSERT OR IGNORE INTO payments (id, user_id, lemon_order_id, plan_type, amount, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), user.id, orderId, planType, totalCents, Date.now()],
    });
  } catch (e) {
    console.error("[lemon webhook] Payment insert failed:", e);
  }

  return NextResponse.json({ ok: true });
}
