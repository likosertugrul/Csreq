import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const db = await getDb();
  const row = (await db.execute({
    sql: "SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?",
    args: [token],
  })).rows[0] as unknown as { user_id: string; expires_at: number } | undefined;

  if (!row || row.expires_at < Date.now()) {
    return NextResponse.json({ error: "Link geçersiz veya süresi dolmuş." }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  await db.execute({
    sql: "UPDATE users SET password_hash = ? WHERE id = ?",
    args: [passwordHash, row.user_id],
  });
  await db.execute({
    sql: "DELETE FROM password_reset_tokens WHERE token = ?",
    args: [token],
  });

  return NextResponse.json({ success: true });
}
