import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { plan } = await req.json();
  if (plan !== "monthly" && plan !== "lifetime") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const baseUrl = plan === "monthly"
    ? process.env.LEMON_MONTHLY_URL
    : process.env.LEMON_LIFETIME_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: "Payment not configured yet" }, { status: 503 });
  }

  let email = "";
  const userId = await getSessionUserId();
  if (userId) {
    const db = await getDb();
    const user = (await db.execute({
      sql: "SELECT email FROM users WHERE id = ?",
      args: [userId],
    })).rows[0] as unknown as { email: string } | undefined;
    if (user) email = user.email as string;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("checkout[custom][plan_type]", plan);
  if (userId) url.searchParams.set("checkout[custom][user_id]", userId);
  if (email) url.searchParams.set("checkout[email]", email);

  return NextResponse.json({ url: url.toString() });
}
