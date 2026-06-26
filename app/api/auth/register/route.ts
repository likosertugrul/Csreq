import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { createSession, sessionCookieOptions } from "@/lib/session";
import { sendVerificationEmail } from "@/lib/email";
import { ADMIN_EMAILS } from "@/lib/admin";

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Geçersiz e-posta veya şifre (min 6 karakter)" }, { status: 400 });
  }

  const db = await getDb();
  const existing = (await db.execute({
    sql: "SELECT id, google_id FROM users WHERE email = ?",
    args: [email],
  })).rows[0] as unknown as { id: string; google_id: string | null } | undefined;

  if (existing) {
    if (existing.google_id) {
      const hasPassword = (await db.execute({
        sql: "SELECT id FROM users WHERE email = ? AND password_hash IS NOT NULL",
        args: [email],
      })).rows[0];
      if (!hasPassword) {
        return NextResponse.json({ error: "Bu e-posta Google ile bağlı. Google ile giriş yap." }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
  }

  const id = randomUUID();
  const password_hash = await hash(password, 10);
  const isAdmin = ADMIN_EMAILS.has(email);
  await db.execute({
    sql: "INSERT INTO users (id, email, password_hash, email_verified, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, email, password_hash, isAdmin ? 1 : 0, Date.now()],
  });
  if (isAdmin) {
    await db.execute({ sql: "UPDATE users SET plan = 'pro', plan_expires_at = NULL WHERE id = ?", args: [id] });
  }

  const session = await createSession(id);

  if (isAdmin) {
    const res = NextResponse.json({ success: true, email, needsVerification: false });
    res.cookies.set(sessionCookieOptions(session));
    return res;
  }

  const token = randomUUID();
  const code = genCode();
  await db.execute({
    sql: "INSERT INTO verification_tokens (token, user_id, expires_at, code) VALUES (?, ?, ?, ?)",
    args: [token, id, Date.now() + 86400000, code],
  });
  try {
    await sendVerificationEmail(email, token, code);
  } catch (err) {
    console.error("[register] Email gönderilemedi:", err);
  }

  const res = NextResponse.json({ success: true, email, needsVerification: true });
  res.cookies.set(sessionCookieOptions(session));
  return res;
}
