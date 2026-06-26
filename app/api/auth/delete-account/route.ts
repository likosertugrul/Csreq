import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserId, clearCookieOptions } from "@/lib/session";

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Oturum açılmamış" }, { status: 401 });

  const db = getDb();
  db.prepare("DELETE FROM pending_sessions WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM verification_tokens WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM user_profiles WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM users WHERE id = ?").run(userId);

  const res = NextResponse.json({ success: true });
  res.cookies.set(clearCookieOptions());
  return res;
}
