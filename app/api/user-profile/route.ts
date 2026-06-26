import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getDb } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, hometown, purpose, interests, notes, homeText, refsText } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "İsim gerekli" }, { status: 400 });

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO user_profiles (user_id, name, hometown, purpose, interests, notes, home_text, refs_text, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            name = excluded.name,
            hometown = excluded.hometown,
            purpose = excluded.purpose,
            interests = excluded.interests,
            notes = excluded.notes,
            home_text = excluded.home_text,
            refs_text = excluded.refs_text,
            updated_at = excluded.updated_at`,
    args: [userId, name, hometown ?? "", purpose ?? "", interests ?? "", notes ?? "", homeText ?? "", refsText ?? "", Date.now()],
  });

  return NextResponse.json({ success: true });
}
