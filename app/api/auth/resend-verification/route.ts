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

  const db = getDb();
  const user = db.prepare("SELECT id, email_verified FROM users WHERE email = ?").get(email) as { id: string; email_verified: number } | undefined;
  if (!user || user.email_verified) return NextResponse.json({ success: true }); // silent

  db.prepare("DELETE FROM verification_tokens WHERE user_id = ?").run(user.id);
  const token = randomUUID();
  const code = genCode();
  db.prepare("INSERT INTO verification_tokens (token, user_id, expires_at, code) VALUES (?, ?, ?, ?)").run(token, user.id, Date.now() + 86400000, code);
  try {
    await sendVerificationEmail(email, token, code);
  } catch (err) {
    console.error("[resend-verification] Email gönderilemedi:", err);
  }

  return NextResponse.json({ success: true });
}
