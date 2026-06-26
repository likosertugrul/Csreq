import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { ADMIN_EMAILS } from "@/lib/admin";

const APP_URL = process.env.APP_URL ?? "http://localhost:3001";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      return NextResponse.redirect(`${APP_URL}/app?auth_error=google_cancelled`);
    }

    const db = getDb();

    const stateRow = db.prepare("SELECT state FROM oauth_states WHERE state = ? AND expires_at > ?").get(state, Date.now());
    if (!stateRow) return NextResponse.redirect(`${APP_URL}/app?auth_error=invalid_state`);
    db.prepare("DELETE FROM oauth_states WHERE state = ?").run(state);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) return NextResponse.redirect(`${APP_URL}/app?auth_error=token_exchange`);
    const { access_token } = await tokenRes.json();

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userInfoRes.ok) return NextResponse.redirect(`${APP_URL}/app?auth_error=userinfo`);
    const { id: googleId, email, verified_email } = await userInfoRes.json();

    if (!email) return NextResponse.redirect(`${APP_URL}/app?auth_error=no_email`);

    let user = db.prepare("SELECT id FROM users WHERE google_id = ?").get(googleId) as { id: string } | undefined;

    if (!user) {
      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined;
      if (existing) {
        db.prepare("UPDATE users SET google_id = ?, email_verified = 1 WHERE id = ?").run(googleId, existing.id);
        user = existing;
      } else {
        const id = randomUUID();
        db.prepare("INSERT INTO users (id, email, google_id, email_verified, created_at) VALUES (?, ?, ?, ?, ?)").run(
          id, email, googleId, verified_email ? 1 : 0, Date.now()
        );
        user = { id };
      }
    }

    // Ensure admin accounts always have pro access
    if (ADMIN_EMAILS.has(email)) {
      db.prepare("UPDATE users SET plan = 'pro', plan_expires_at = NULL, email_verified = 1 WHERE id = ?").run(user.id);
    }

    // Store a short-lived pending session token (60s) so the client can exchange it
    // via a same-site POST — required for Safari ITP compatibility
    const pendingToken = randomUUID();
    db.prepare("DELETE FROM pending_sessions WHERE expires_at < ?").run(Date.now());
    db.prepare("INSERT INTO pending_sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(
      pendingToken, user.id, Date.now() + 60000
    );

    return NextResponse.redirect(`${APP_URL}/app?pending_session=${pendingToken}`);
  } catch (err) {
    console.error("[google/callback] ERROR:", err);
    return NextResponse.redirect(`${APP_URL}/app?auth_error=internal`);
  }
}
