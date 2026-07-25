import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";

const MONTH_MS = 31 * 24 * 60 * 60 * 1000;

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

  const meta = (payload.meta as Record<string, unknown>) ?? {};
  const eventName = meta.event_name as string;
  const customData = (meta.custom_data as Record<string, unknown>) ?? {};
  const customUserId = customData.user_id as string | undefined;
  const planType = (customData.plan_type as string) || "monthly"; // 'monthly' | 'lifetime'

  const data = (payload.data as Record<string, unknown>) ?? {};
  const attrs = (data.attributes as Record<string, unknown>) ?? {};
  const userEmail = attrs.user_email as string | undefined;
  const orderId = (data.id as string) ?? String(Date.now());
  const totalCents = Number(attrs.total ?? 0);
  // On a subscription-invoice: "initial" | "renewal" | "updated".
  const billingReason = attrs.billing_reason as string | undefined;

  // Events we act on. Anything else (subscription_created, _updated, _cancelled,
  // refunds, ...) is acknowledged so Lemon Squeezy stops retrying.
  const HANDLED = new Set([
    "order_created",              // one-time (lifetime) or first subscription charge
    "subscription_payment_success", // recurring monthly renewal
    "subscription_expired",       // subscription lapsed → downgrade
  ]);
  if (!HANDLED.has(eventName)) {
    return NextResponse.json({ ok: true });
  }

  if (!customUserId && !userEmail) {
    return NextResponse.json({ error: "Missing user identity" }, { status: 400 });
  }

  const db = await getDb();
  // Prefer the logged-in user's id (captured at checkout); fall back to the
  // email typed into the Lemon Squeezy checkout, which may differ.
  let user = customUserId
    ? (await db.execute({
        sql: "SELECT id, plan_expires_at FROM users WHERE id = ?",
        args: [customUserId],
      })).rows[0] as unknown as { id: string; plan_expires_at: number | null } | undefined
    : undefined;

  if (!user && userEmail) {
    user = (await db.execute({
      sql: "SELECT id, plan_expires_at FROM users WHERE email = ?",
      args: [userEmail],
    })).rows[0] as unknown as { id: string; plan_expires_at: number | null } | undefined;
  }

  if (!user) {
    console.warn("[lemon webhook] No user found for", customUserId ?? userEmail);
    return NextResponse.json({ ok: true });
  }

  if (eventName === "subscription_expired") {
    await db.execute({
      sql: "UPDATE users SET plan = 'free', plan_expires_at = NULL WHERE id = ?",
      args: [user.id],
    });
    return NextResponse.json({ ok: true });
  }

  // The first monthly charge fires BOTH order_created and
  // subscription_payment_success (billing_reason "initial"). order_created owns
  // the initial grant; the initial payment_success is a no-op so the term isn't
  // counted twice. Only genuine renewals extend it.
  if (eventName === "subscription_payment_success" && billingReason === "initial") {
    return NextResponse.json({ ok: true });
  }

  // Grant (order_created) or extend (renewal) pro. Lifetime never expires.
  // Monthly's initial grant is a fixed 31-day term; a renewal adds 31 days from
  // whichever is later — now or the current expiry — so an early charge doesn't
  // shorten the term.
  let planExpiresAt: number | null;
  if (planType === "lifetime") {
    planExpiresAt = null;
  } else if (eventName === "order_created") {
    planExpiresAt = Date.now() + MONTH_MS;
  } else {
    const base = Math.max(Date.now(), user.plan_expires_at ?? 0);
    planExpiresAt = base + MONTH_MS;
  }

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
