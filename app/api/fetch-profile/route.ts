import { NextRequest, NextResponse } from "next/server";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

const LOGIN_SIGNALS = ["Connect with Google", "Continue with Email", "Log In to Couchsurfing", "Need help logging in"];

async function fetchText(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
    const finalUrl = res.url;
    if (finalUrl.includes("/login") || finalUrl.includes("/signin") || finalUrl.includes("not-found")) return "";
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (LOGIN_SIGNALS.some(s => text.includes(s))) return "";
    return text.length > 200 ? text : "";
  } catch {
    return "";
  }
}

function extractHandle(url: string, profileText: string): string | null {
  const urlMatch = url.match(/\/c\/(?:users|references)\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];
  const atMatch = profileText.match(/@([a-zA-Z0-9_-]{3,})/);
  if (atMatch) return atMatch[1];
  return null;
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ success: false, reason: "invalid_url" }, { status: 400 });
  }

  const profileText = await fetchText(url);
  if (!profileText) {
    return NextResponse.json({ success: false, reason: "login_required" });
  }

  const handle = extractHandle(url, profileText);

  let homeText = "";
  let refsText = "";
  if (handle) {
    [homeText, refsText] = await Promise.all([
      fetchText(`https://www.couchsurfing.com/c/users/${handle}/home`),
      fetchText(`https://www.couchsurfing.com/c/references/${handle}`),
    ]);
  }

  const sections: string[] = [`=== Profil ===\n${profileText.slice(0, 10000)}`];
  if (homeText) sections.push(`=== Ev (Home) ===\n${homeText.slice(0, 6000)}`);
  if (refsText) sections.push(`=== Referanslar ===\n${refsText.slice(0, 6000)}`);

  return NextResponse.json({
    success: true,
    text: sections.join("\n\n"),
    sections: { profile: true, home: !!homeText, references: !!refsText },
  });
}
