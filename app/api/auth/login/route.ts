import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "E-posta ve şifre gerekli" }, { status: 400 });
  }

  const db = await getDb();
  const user = (await db.execute({
    sql: "SELECT id, password_hash, email_verified FROM users WHERE email = ?",
    args: [email],
  })).rows[0] as unknown as { id: string; password_hash: string; email_verified: number } | undefined;

  if (!user || !(await compare(password, user.password_hash as string))) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
  }

  const token = await createSession(user.id as string);
  const res = NextResponse.json({
    success: true,
    email,
    needsVerification: user.email_verified !== 1,
  });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
