import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { ADMIN_EMAILS } from "@/lib/admin";
import { createSession, sessionCookieOptions } from "@/lib/session";

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

    const db = await getDb();

    const stateRow = (await db.execute({
      sql: "SELECT state FROM oauth_states WHERE state = ? AND expires_at > ?",
      args: [state, Date.now()],
    })).rows[0];
    if (!stateRow) return NextResponse.redirect(`${APP_URL}/app?auth_error=invalid_state`);
    await db.execute({ sql: "DELETE FROM oauth_states WHERE state = ?", args: [state] });

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

    let userRow = (await db.execute({
      sql: "SELECT id FROM users WHERE google_id = ?",
      args: [googleId],
    })).rows[0] as unknown as { id: string } | undefined;

    if (!userRow) {
      const existing = (await db.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [email],
      })).rows[0] as unknown as { id: string } | undefined;

      if (existing) {
        await db.execute({
          sql: "UPDATE users SET google_id = ?, email_verified = 1 WHERE id = ?",
          args: [googleId, existing.id],
        });
        userRow = existing;
      } else {
        const id = randomUUID();
        await db.execute({
          sql: "INSERT INTO users (id, email, google_id, email_verified, created_at) VALUES (?, ?, ?, ?, ?)",
          args: [id, email, googleId, verified_email ? 1 : 0, Date.now()],
        });
        userRow = { id };
      }
    }

    // Ensure admin accounts always have pro access
    if (ADMIN_EMAILS.has(email)) {
      await db.execute({
        sql: "UPDATE users SET plan = 'pro', plan_expires_at = NULL, email_verified = 1 WHERE id = ?",
        args: [userRow.id],
      });
    }

    // Store a short-lived pending session token (60s) so the client can exchange it
    // via a same-site POST — required for Safari ITP compatibility
    const pendingToken = randomUUID();
    await db.execute({ sql: "DELETE FROM pending_sessions WHERE expires_at < ?", args: [Date.now()] });
    await db.execute({
      sql: "INSERT INTO pending_sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
      args: [pendingToken, userRow.id, Date.now() + 60000],
    });

    // Exchange pending token immediately for a session cookie
    const sessionToken = await createSession(userRow.id as string);
    const res = NextResponse.redirect(`${APP_URL}/app?pending_session=${pendingToken}`);
    res.cookies.set(sessionCookieOptions(sessionToken));
    return res;
  } catch (err) {
    console.error("[google/callback] ERROR:", err);
    return NextResponse.redirect(`${APP_URL}/app?auth_error=internal`);
  }
}
