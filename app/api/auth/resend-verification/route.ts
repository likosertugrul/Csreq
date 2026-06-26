import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });

  const db = await getDb();
  const user = (await db.execute({
    sql: "SELECT id, email_verified FROM users WHERE email = ?",
    args: [email],
  })).rows[0] as unknown as { id: string; email_verified: number } | undefined;
  if (!user || user.email_verified) return NextResponse.json({ success: true }); // silent

  await db.execute({ sql: "DELETE FROM verification_tokens WHERE user_id = ?", args: [user.id] });
  const token = randomUUID();
  const code = genCode();
  await db.execute({
    sql: "INSERT INTO verification_tokens (token, user_id, expires_at, code) VALUES (?, ?, ?, ?)",
    args: [token, user.id, Date.now() + 86400000, code],
  });
  try {
    await sendVerificationEmail(email, token, code);
  } catch (err) {
    console.error("[resend-verification] Email gönderilemedi:", err);
  }

  return NextResponse.json({ success: true });
}
