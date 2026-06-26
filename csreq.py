#!/usr/bin/env python3
"""
csreq — CouchSurfing istek mektubu yazarı
Kullanım:
  python3 csreq.py setup              # profilini kaydet
  python3 csreq.py <profile_url>      # mektubu üret
"""

import sys
import json
import os
import subprocess
import re
from pathlib import Path
from datetime import datetime, date

PROFILE_PATH = Path.home() / ".csreq" / "profile.json"

SYSTEM_PROMPT = """You are an expert at writing warm, genuine, and personalized CouchSurfing couch request letters. Your letters feel human, not templated. Always reference specific things from the host's profile. Never start with "As an AI." Be concise (150-250 words). Open with the guest's name and a specific hook tied to something in the host's profile."""


# ── Profile management ───────────────────────────────────────────────────────

def load_profile() -> dict | None:
    if PROFILE_PATH.exists():
        return json.loads(PROFILE_PATH.read_text())
    return None


def save_profile(profile: dict):
    PROFILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    PROFILE_PATH.write_text(json.dumps(profile, ensure_ascii=False, indent=2))


def setup():
    print("\n── Profilini Tanıt ──────────────────────────────")
    existing = load_profile() or {}

    def ask(prompt, key, default=""):
        val = existing.get(key, default)
        hint = f" [{val}]" if val else ""
        answer = input(f"{prompt}{hint}: ").strip()
        return answer if answer else val

    profile = {
        "name":      ask("Adın", "name"),
        "hometown":  ask("Nereden geliyorsun", "hometown"),
        "purpose":   ask("Seyahat amacın", "purpose"),
        "interests": ask("İlgi alanların", "interests"),
        "notes":     ask("Ev sahiplerine eklemek istediklerin", "notes"),
    }

    save_profile(profile)
    print(f"\n✓ Profil kaydedildi → {PROFILE_PATH}\n")


# ── CouchSurfing scraper ─────────────────────────────────────────────────────

def scrape_profile(url: str) -> str:
    """Kullanıcının Chrome oturumunu kullanarak profil metnini çeker."""
    from playwright.sync_api import sync_playwright

    chrome_user_data = os.path.expanduser(
        "~/Library/Application Support/Google/Chrome"
    )

    print("Profil çekiliyor (Chrome oturumun kullanılıyor)...")

    with sync_playwright() as p:
        try:
            ctx = p.chromium.launch_persistent_context(
                user_data_dir=chrome_user_data,
                channel="chrome",
                headless=True,
                args=["--no-sandbox", "--disable-gpu"],
            )
        except Exception:
            # Chrome profili meşgulse yeni profille dene
            ctx = p.chromium.launch_persistent_context(
                user_data_dir=str(Path.home() / ".csreq" / "browser-profile"),
                headless=False,
                slow_mo=500,
            )

        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=20000)
        page.wait_for_timeout(2000)

        # Giriş yapılmamışsa uyar
        if any(x in page.url for x in ["login", "signin", "sign-in"]):
            ctx.close()
            print("\n⚠ CouchSurfing giriş gerektiriyor.")
            print("  Chrome'da couchsurfing.com'a giriş yap ve tekrar dene.\n")
            sys.exit(1)

        # Sayfanın görünür metnini al; nav/footer'ı çıkar
        text = page.evaluate("""() => {
            const remove = ['nav', 'footer', 'header', '[role="navigation"]',
                            '[role="banner"]', 'script', 'style', 'noscript'];
            remove.forEach(sel => document.querySelectorAll(sel)
                .forEach(el => el.remove()));
            const main = document.querySelector('main')
                      || document.querySelector('[role="main"]')
                      || document.body;
            return main.innerText;
        }""")

        ctx.close()

    # Temizle
    text = re.sub(r'\n{3,}', '\n\n', text).strip()
    return text[:6000]


# ── Prompt builder ───────────────────────────────────────────────────────────

def ask_dates() -> tuple[str, str]:
    today = date.today().isoformat()
    while True:
        ci = input(f"Check-in tarihi (YYYY-MM-DD): ").strip() or today
        co = input(f"Check-out tarihi (YYYY-MM-DD): ").strip()
        try:
            d_in  = datetime.strptime(ci, "%Y-%m-%d").date()
            d_out = datetime.strptime(co, "%Y-%m-%d").date()
            if d_out > d_in:
                return ci, co
            print("Çıkış tarihi girişten sonra olmalı.")
        except ValueError:
            print("Format: YYYY-MM-DD")


def ask_language() -> str:
    lang = input("Dil (EN/TR) [EN]: ").strip().upper()
    return lang if lang in ("EN", "TR") else "EN"


def build_prompt(profile: dict, host_text: str, check_in: str, check_out: str, lang: str) -> str:
    d_in  = datetime.strptime(check_in,  "%Y-%m-%d").date()
    d_out = datetime.strptime(check_out, "%Y-%m-%d").date()
    nights = (d_out - d_in).days
    lang_line = "Mektubu Türkçe yaz." if lang == "TR" else "Write the letter in English."

    return f"""{SYSTEM_PROMPT}

---

My profile:
Name: {profile['name']}
Hometown: {profile['hometown']}
Purpose of travel: {profile['purpose']}
Interests: {profile['interests']}
Additional notes: {profile['notes']}

Host's profile:
{host_text}

Stay dates: {check_in} to {check_out} ({nights} night{'s' if nights != 1 else ''})

{lang_line}

Requirements:
- Reference at least 2 specific things from the host's profile
- Briefly mention the travel purpose
- End with a genuine question about the host or their space
- 150-250 words, sound like a real person"""


# ── Main ─────────────────────────────────────────────────────────────────────

def generate(url: str):
    profile = load_profile()
    if not profile:
        print("Önce profilini kaydet: python3 csreq.py setup")
        sys.exit(1)

    host_text = scrape_profile(url)
    print(f"✓ Profil alındı ({len(host_text)} karakter)\n")

    check_in, check_out = ask_dates()
    lang = ask_language()

    prompt = build_prompt(profile, host_text, check_in, check_out, lang)

    print("\nMektup yazılıyor...\n" + "─" * 50)

    result = subprocess.run(
        ["claude", "--print", prompt],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print("Hata:", result.stderr)
        sys.exit(1)

    letter = result.stdout.strip()
    print(letter)
    print("─" * 50)

    # Panoya kopyala
    subprocess.run(["pbcopy"], input=letter, text=True)
    print("\n✓ Mektup panoya kopyalandı.\n")


def main():
    if len(sys.argv) < 2 or sys.argv[1] == "setup":
        setup()
    else:
        generate(sys.argv[1])


if __name__ == "__main__":
    main()
