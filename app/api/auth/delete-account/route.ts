import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserId, clearCookieOptions } from "@/lib/session";

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Oturum açılmamış" }, { status: 401 });

  const db = await getDb();
  await db.execute({ sql: "DELETE FROM pending_sessions WHERE user_id = ?", args: [userId] });
  await db.execute({ sql: "DELETE FROM verification_tokens WHERE user_id = ?", args: [userId] });
  await db.execute({ sql: "DELETE FROM user_profiles WHERE user_id = ?", args: [userId] });
  await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [userId] });

  const res = NextResponse.json({ success: true });
  res.cookies.set(clearCookieOptions());
  return res;
}
