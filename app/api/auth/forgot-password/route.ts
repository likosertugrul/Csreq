import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });

  const db = await getDb();
  const user = (await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email.trim().toLowerCase()],
  })).rows[0] as unknown as { id: string } | undefined;

  // Always return success to avoid email enumeration
  if (!user) return NextResponse.json({ success: true });

  await db.execute({ sql: "DELETE FROM password_reset_tokens WHERE user_id = ?", args: [user.id] });
  const token = randomUUID();
  await db.execute({
    sql: "INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
    args: [token, user.id, Date.now() + 3600000],
  });

  try {
    await sendPasswordResetEmail(email.trim(), token);
  } catch (err) {
    console.error("[forgot-password] Email gönderilemedi:", err);
  }

  return NextResponse.json({ success: true });
}
