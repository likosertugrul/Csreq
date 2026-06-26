import { NextRequest, NextResponse } from "next/server";
import { generateLetter } from "@/lib/claude";
import { buildLetterPrompt, UserProfile, LANGUAGES } from "@/lib/prompts";
import { getSessionUserId } from "@/lib/session";
import { getDb } from "@/lib/db";
import { ADMIN_EMAILS } from "@/lib/admin";

const FREE_LIMIT = 5;

function isProUser(user: { plan: string; plan_expires_at: number | null; email?: string }) {
  if (user.email && ADMIN_EMAILS.has(user.email)) return true;
  return user.plan === "pro" && (!user.plan_expires_at || user.plan_expires_at > Date.now());
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();

  if (userId) {
    const db = await getDb();
    const user = (await db.execute({
      sql: "SELECT email, email_verified, letters_used, plan, plan_expires_at FROM users WHERE id = ?",
      args: [userId],
    })).rows[0] as unknown as {
      email: string; email_verified: number; letters_used: number; plan: string; plan_expires_at: number | null;
    } | undefined;

    if (!user || user.email_verified !== 1) {
      return NextResponse.json({ error: "E-posta doğrulanmamış" }, { status: 403 });
    }
    if (!isProUser(user as { plan: string; plan_expires_at: number | null; email: string }) && (user.letters_used as number) >= FREE_LIMIT) {
      return NextResponse.json({ error: "limit_reached", lettersUsed: user.letters_used }, { status: 402 });
    }
  }

  const { userProfile, hostProfileText, hostHomeText, hostRefsText, checkIn, checkOut, language, charLimit: rawLimit } =
    await req.json();

  const charLimit = Math.min(Math.max(Number(rawLimit) || 980, 300), 2000);

  const validCodes = new Set(LANGUAGES.map(l => l.code));
  if (!userProfile || !hostProfileText || !checkIn || !checkOut || !language || !validCodes.has(language)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const prompt = buildLetterPrompt(
      userProfile as UserProfile,
      hostProfileText,
      checkIn,
      checkOut,
      language,
      hostHomeText,
      hostRefsText,
      charLimit,
    );

    let letter = await generateLetter(prompt);
    if (letter.length > charLimit) {
      letter = await generateLetter(
        `The following letter is ${letter.length} characters long, which exceeds the ${charLimit}-character limit. Rewrite it so it ends naturally and is strictly under ${charLimit} characters. Do not cut it mid-sentence — find a natural ending point. Return only the rewritten letter, nothing else.\n\n${letter}`
      );
    }

    // Increment counter for logged-in free users
    if (userId) {
      const db = await getDb();
      const user = (await db.execute({
        sql: "SELECT email, plan, plan_expires_at FROM users WHERE id = ?",
        args: [userId],
      })).rows[0] as unknown as { email: string; plan: string; plan_expires_at: number | null } | undefined;
      if (user && !isProUser(user as { plan: string; plan_expires_at: number | null; email: string })) {
        await db.execute({ sql: "UPDATE users SET letters_used = letters_used + 1 WHERE id = ?", args: [userId] });
      }
    }

    return NextResponse.json({ letter });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
