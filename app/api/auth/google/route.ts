import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

const APP_URL = process.env.APP_URL ?? "http://localhost:3001";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";

export async function GET() {
  if (!CLIENT_ID) {
    return NextResponse.json({ error: "Google OAuth yapılandırılmamış" }, { status: 503 });
  }

  const state = randomUUID();
  const db = await getDb();
  await db.execute({ sql: "INSERT INTO oauth_states (state, expires_at) VALUES (?, ?)", args: [state, Date.now() + 600000] });

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
