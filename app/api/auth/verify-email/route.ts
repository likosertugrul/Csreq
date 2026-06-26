import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const APP_URL = process.env.APP_URL ?? "http://localhost:3001";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(`${APP_URL}?verified=invalid`);

  const db = await getDb();
  const row = (await db.execute({
    sql: "SELECT user_id, expires_at FROM verification_tokens WHERE token = ?",
    args: [token],
  })).rows[0] as unknown as { user_id: string; expires_at: number } | undefined;

  if (!row || (row.expires_at as number) < Date.now()) {
    await db.execute({ sql: "DELETE FROM verification_tokens WHERE token = ?", args: [token] });
    return NextResponse.redirect(`${APP_URL}?verified=expired`);
  }

  await db.execute({ sql: "UPDATE users SET email_verified = 1 WHERE id = ?", args: [row.user_id] });
  await db.execute({ sql: "DELETE FROM verification_tokens WHERE token = ?", args: [token] });

  return NextResponse.redirect(`${APP_URL}?verified=ok`);
}
