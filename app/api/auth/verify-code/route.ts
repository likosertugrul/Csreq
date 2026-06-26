import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });
  }

  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });

  const db = getDb();
  const row = db.prepare(
    "SELECT token FROM verification_tokens WHERE user_id = ? AND code = ? AND expires_at > ?"
  ).get(userId, code.trim(), Date.now()) as { token: string } | undefined;

  if (!row) return NextResponse.json({ error: "Kod hatalı veya süresi dolmuş" }, { status: 400 });

  db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(userId);
  db.prepare("DELETE FROM verification_tokens WHERE user_id = ?").run(userId);

  return NextResponse.json({ success: true });
}
