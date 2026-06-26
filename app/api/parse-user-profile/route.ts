import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Extract info from this CouchSurfing profile and return ONLY valid JSON (no markdown, no explanation):

{
  "name": "first name only",
  "hometown": "city, country they're from",
  "interests": "comma-separated hobbies/interests",
  "purpose": "why they typically travel (infer from profile)",
  "notes": "anything relevant about them as a traveler/guest (max 1 sentence)"
}

Profile:
${text.slice(0, 4000)}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, profile: parsed });
  } catch {
    return NextResponse.json({ success: false, error: "Parse failed" });
  }
}
