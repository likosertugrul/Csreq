import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSession, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token gerekli" }, { status: 400 });

  const db = await getDb();
  const row = (await db.execute({
    sql: "SELECT user_id FROM pending_sessions WHERE token = ? AND expires_at > ?",
    args: [token, Date.now()],
  })).rows[0] as unknown as { user_id: string } | undefined;

  if (!row) return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token" }, { status: 401 });
  await db.execute({ sql: "DELETE FROM pending_sessions WHERE token = ?", args: [token] });

  const sessionToken = await createSession(row.user_id as string);
  const res = NextResponse.json({ success: true });
  res.cookies.set(sessionCookieOptions(sessionToken));
  return res;
}
