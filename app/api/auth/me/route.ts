import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getDb } from "@/lib/db";
import { ADMIN_EMAILS } from "@/lib/admin";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ user: null });

  const db = await getDb();
  const user = (await db.execute({
    sql: "SELECT id, email, email_verified, letters_used, plan, plan_expires_at FROM users WHERE id = ?",
    args: [userId],
  })).rows[0] as unknown as { id: string; email: string; email_verified: number; letters_used: number; plan: string; plan_expires_at: number | null } | undefined;
  if (!user) return NextResponse.json({ user: null });

  const profile = (await db.execute({
    sql: "SELECT name, hometown, purpose, interests, notes, home_text, refs_text FROM user_profiles WHERE user_id = ?",
    args: [userId],
  })).rows[0] as unknown as {
    name: string; hometown: string; purpose: string; interests: string; notes: string; home_text: string; refs_text: string;
  } | undefined;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.email_verified === 1,
      profile: profile ? {
        name: profile.name,
        hometown: profile.hometown,
        purpose: profile.purpose,
        interests: profile.interests,
        notes: profile.notes,
        homeText: profile.home_text,
        refsText: profile.refs_text,
      } : null,
      lettersUsed: user.letters_used ?? 0,
      plan: user.plan ?? "free",
      isPro: ADMIN_EMAILS.has(user.email as string) || (user.plan === "pro" && (!user.plan_expires_at || (user.plan_expires_at as number) > Date.now())),
    },
  });
}
