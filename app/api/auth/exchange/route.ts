import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSession, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token gerekli" }, { status: 400 });

  const db = getDb();
  const row = db.prepare("SELECT user_id FROM pending_sessions WHERE token = ? AND expires_at > ?").get(token, Date.now()) as { user_id: string } | undefined;

  if (!row) return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token" }, { status: 401 });
  db.prepare("DELETE FROM pending_sessions WHERE token = ?").run(token);

  const sessionToken = await createSession(row.user_id);
  const res = NextResponse.json({ success: true });
  res.cookies.set(sessionCookieOptions(sessionToken));
  return res;
}
