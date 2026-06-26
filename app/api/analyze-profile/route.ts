import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { profileText, homeText, refsText, userGender } = await req.json();

  const combined = [profileText, homeText, refsText].filter(Boolean).join("\n\n").trim();
  if (combined.length < 80) return NextResponse.json({ warnings: [] });

  const genderCtx = userGender === "male" ? "male" : userGender === "female" ? "female" : "unknown";

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: `You analyze CouchSurfing host profiles for important conditions a guest should know before sending a request. Respond with a JSON array only, no extra text.`,
    messages: [{
      role: "user",
      content: `Guest gender: ${genderCtx}

Analyze this host profile and return a JSON array of warnings the guest should see. Each item: { "type": "restriction" | "info", "message": "<concise message in the same language as the profile, or Turkish if unclear>" }

Check for:
- Gender restrictions (female-only, male-only, couples-only, no singles). If restriction applies to the guest's gender, use type "restriction".
- Nudism / naturism
- Strong religious practices or requirements for guests
- Age restrictions
- Pets (dogs/cats) that guests with allergies should know about
- Strict house rules (e.g. must be vegan, must participate in activities, strict schedule)
- Minimum stay longer than 3 nights
- Any other important unusual conditions

Only include things that meaningfully affect whether the guest should send a request. Skip minor preferences. If nothing important, return [].

Profile:
${combined}`,
    }],
  });

  try {
    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
    const match = text.match(/\[[\s\S]*\]/);
    const warnings = match ? JSON.parse(match[0]) : [];
    return NextResponse.json({ warnings });
  } catch {
    return NextResponse.json({ warnings: [] });
  }
}
