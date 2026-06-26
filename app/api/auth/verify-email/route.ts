import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const APP_URL = process.env.APP_URL ?? "http://localhost:3001";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(`${APP_URL}?verified=invalid`);

  const db = getDb();
  const row = db.prepare("SELECT user_id, expires_at FROM verification_tokens WHERE token = ?").get(token) as { user_id: string; expires_at: number } | undefined;

  if (!row || row.expires_at < Date.now()) {
    db.prepare("DELETE FROM verification_tokens WHERE token = ?").run(token);
    return NextResponse.redirect(`${APP_URL}?verified=expired`);
  }

  db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(row.user_id);
  db.prepare("DELETE FROM verification_tokens WHERE token = ?").run(token);

  return NextResponse.redirect(`${APP_URL}?verified=ok`);
}
