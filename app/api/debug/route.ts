import { NextResponse } from "next/server";
import { createClient } from "@libsql/client/http";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL ?? "(missing)";
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL ?? "file:./csreq.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    await db.execute("SELECT 1");
    return NextResponse.json({ ok: true, url, hasToken });
  } catch (err) {
    return NextResponse.json({ ok: false, url, hasToken, error: String(err) }, { status: 500 });
  }
}
