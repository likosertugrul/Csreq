"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Logo from "@/components/Logo";

type LandingLang = "TR" | "EN";

const LT = {
  EN: {
    tryFree: "Try free →",
    dark: "Dark", light: "Light",
    heroBadge: "Couch Request",
    heroTitle: <>Write the perfect<br />host message.<br /></>,
    heroItalic: "In seconds.",
    heroSub: "Paste the host's profile. Pick your dates. Get a genuine, personalized letter that references things they actually care about.",
    heroFreeNote: "5 letters free · no credit card",
    exBadge: "See it in action",
    exTitle: "Letters that get replies.",
    exSub: "Click any card to read the full letter.",
    exModalBadge: "Example letter",
    exCopy: "Copy", exCopied: "✓ Copied",
    howBadge: "How it works",
    howTitle: "Three steps.",
    howSteps: [
      { title: "Paste the host's profile", body: "Copy the text from their CouchSurfing page — or just paste the URL. Works with the profile, home section, and references." },
      { title: "Pick your dates", body: "Set your arrival and departure. The letter automatically mentions how long you're staying." },
      { title: "Read your letter", body: "A personalized, human-sounding letter appears in seconds. Edit it freely, then copy and send." },
    ],
    vsBadge: "vs. asking an llm directly",
    vsTitle: <>ChatGPT writes a letter.<br /></>,
    vsItalic: "This one might get a reply.",
    vsSub: "You can ask ChatGPT to write a couch request. What comes back is grammatically correct, politically inoffensive, and completely forgettable. Hosts can smell it. We built a tool that specifically solves that problem.",
    vsProblem: "The problem",
    vsCards: [
      { title: "LLMs have a writing fingerprint", body: "Every LLM reaches for the same phrases. Hosts who read a hundred requests a month recognize them immediately. A letter that reads like AI is a letter that gets archived.", listTitle: "blocked in csreq", list: ["\"vibrant local culture\"","\"tapestry of experiences\"","\"I would be honored\"","not only … but also …","em dash overuse —","\"seamless\" / \"crucial\" / \"foster\""] },
      { title: "ChatGPT doesn't know CouchSurfing's rules", body: "CouchSurfing cuts off request messages at 995 characters. A raw LLM will happily write 400 words that get silently truncated before the host ever sees your name.", badLabel: "ChatGPT output", badText: "1,340 chars — host sees first 995, letter ends mid-sentence", goodLabel: "csreq output", goodText: "874 chars — ends on a real sentence, nothing cut" },
      { title: "Generic beats specific every time — in the wrong direction", body1: "When you ask ChatGPT to write a request, it writes about \"learning from locals\" and \"exploring authentic culture.\" That's the default. It doesn't know the host spent two years building a rooftop garden or that they only host people who cook.", body2: "csreq reads the actual profile text and pulls the details that matter — a specific hobby, an unusual living situation, something the host wrote that most travelers skip over. The resulting letter is one the host can tell was written for them." },
      { title: "LLMs don't read the fine print", body: "Hosts often bury important conditions in their profile — female guests only, minimum three nights, no guests during certain months, nudist household. ChatGPT writes a cheerful letter regardless.", warnings: ["Female guests only","Minimum 3-night stay","No guests until March"], warnSuffix: "— detected from profile", warnNote: "csreq flags these conditions before you write. You won't send a perfect letter to the wrong host." },
    ],
    featBadge: "Why different",
    featTitle: <>Built for real travelers,<br /></>,
    featItalic: "not templates.",
    pricBadge: "Pricing",
    pricTitle: "Simple and fair.",
    pricFree: { label: "Free", price: "$0", note: "No credit card required", features: ["5 letters total","All languages","Full editor","Host warnings"], cta: "Get started" },
    pricMonthly: { label: "Monthly", price: "$5", per: "/month", note: "Cancel anytime", features: ["Unlimited letters","All languages","Full editor","Host warnings","Priority support"], cta: "Start free, upgrade later" },
    pricLifetime: { label: "Lifetime", price: "$25", note: "One payment, forever", features: ["Unlimited letters","All languages","Full editor","Host warnings","Priority support","All future features"], cta: "Get lifetime access →", badge: "Best value" },
    footerText: "© 2025 csreq. Write better couch requests.",
  },
  TR: {
    tryFree: "Ücretsiz Dene →",
    dark: "Koyu", light: "Açık",
    heroBadge: "Couch Request",
    heroTitle: <>Mükemmel ev sahibi<br />mesajını yaz.<br /></>,
    heroItalic: "Saniyeler içinde.",
    heroSub: "Ev sahibinin profilini yapıştır. Tarihlerini seç. Gerçekten kişisel, onların ilgi alanlarına değinen bir mektup al.",
    heroFreeNote: "5 ücretsiz mektup · kredi kartı gerekmez",
    exBadge: "Uygulamaya bak",
    exTitle: "Yanıt alan mektuplar.",
    exSub: "Tam mektubu okumak için kartlardan birine tıkla.",
    exModalBadge: "Örnek mektup",
    exCopy: "Kopyala", exCopied: "✓ Kopyalandı",
    howBadge: "Nasıl çalışır",
    howTitle: "Üç adım.",
    howSteps: [
      { title: "Ev sahibinin profilini yapıştır", body: "CouchSurfing sayfasındaki metni kopyala — ya da URL'yi yapıştır. Profil, home bölümü ve referanslarla çalışır." },
      { title: "Tarihlerini seç", body: "Varış ve ayrılış tarihlerini gir. Mektup kaç gece kalacağını otomatik olarak belirtir." },
      { title: "Mektubunu oku", body: "Saniyeler içinde kişiselleştirilmiş, insan gibi yazan bir mektup çıkar. İstediğin gibi düzenle, kopyala ve gönder." },
    ],
    vsBadge: "doğrudan llm'e sormak yerine",
    vsTitle: <>ChatGPT bir mektup yazar.<br /></>,
    vsItalic: "Bu ise yanıt alabilir.",
    vsSub: "ChatGPT'den couch request yazmasını isteyebilirsin. Geri gelen şey dilbilgisi açısından doğru, siyasi olarak güvenli ve tamamen unutulabilir bir şeydir. Ev sahipleri fark eder. Biz tam olarak bu sorunu çözmek için bir araç yaptık.",
    vsProblem: "Sorun",
    vsCards: [
      { title: "LLM'lerin bir yazı parmak izi var", body: "Her LLM aynı ifadelere uzanır. Ayda yüzlerce istek okuyan ev sahipleri anında tanır. AI gibi görünen mektup, arşive giden mektuptur.", listTitle: "csreq'te engellendi", list: ["\"canlı yerel kültür\"","\"deneyimler dokusu\"","\"onurlandırılırdım\"","yalnızca … değil aynı zamanda …","uzun çizgi kötüye kullanımı —","\"sorunsuz\" / \"hayati\" / \"geliştirmek\""] },
      { title: "ChatGPT CouchSurfing kurallarını bilmez", body: "CouchSurfing istek mesajlarını 995 karakterde keser. Saf bir LLM, ev sahibi adını bile görmeden sessizce kırpılacak 400 kelime yazar.", badLabel: "ChatGPT çıktısı", badText: "1.340 karakter — ev sahibi ilk 995'i görür, mektup cümle ortasında biter", goodLabel: "csreq çıktısı", goodText: "874 karakter — gerçek bir cümlede biter, hiçbir şey kesilmez" },
      { title: "Genellik her zaman özgünlüğü yener — ama ters yönde", body1: "ChatGPT'den istek yazmasını isteyince \"yerlilerden öğrenmek\" ve \"özgün kültürü keşfetmek\" hakkında yazar. Bu varsayılan. Ev sahibinin iki yıldır çatı bahçesi kurduğunu ya da yalnızca yemek yapan misafirlere yer verdiğini bilmez.", body2: "csreq gerçek profil metnini okur ve önemli detayları çıkarır — özel bir hobi, alışılmadık bir yaşam ortamı, ev sahibinin çoğu gezginin atlayacağı bir şeyi. Ortaya çıkan mektup, ev sahibinin kendisi için yazıldığını anlayabileceği biridir." },
      { title: "LLM'ler küçük yazıları okumaz", body: "Ev sahipleri önemli koşulları profillerine gömer — yalnızca kadın misafirler, minimum üç gece, belirli aylarda misafir yok, nudist ev. ChatGPT buna rağmen neşeli bir mektup yazar.", warnings: ["Yalnızca kadın misafirler","Minimum 3 gece konaklama","Mart'a kadar misafir yok"], warnSuffix: "— profilden tespit edildi", warnNote: "csreq bu koşulları yazmadan önce işaretler. Mükemmel bir mektup yanlış ev sahibine gitmez." },
    ],
    featBadge: "Neden farklı",
    featTitle: <>Gerçek gezginler için,<br /></>,
    featItalic: "şablonlar için değil.",
    pricBadge: "Fiyatlandırma",
    pricTitle: "Basit ve adil.",
    pricFree: { label: "Ücretsiz", price: "$0", note: "Kredi kartı gerekmez", features: ["Toplam 5 mektup","Tüm diller","Tam editör","Ev sahibi uyarıları"], cta: "Başla" },
    pricMonthly: { label: "Aylık", price: "$5", per: "/ay", note: "İstediğin zaman iptal et", features: ["Sınırsız mektup","Tüm diller","Tam editör","Ev sahibi uyarıları","Öncelikli destek"], cta: "Ücretsiz başla, sonra yükselt" },
    pricLifetime: { label: "Ömür Boyu", price: "$25", note: "Tek ödeme, sonsuza dek", features: ["Sınırsız mektup","Tüm diller","Tam editör","Ev sahibi uyarıları","Öncelikli destek","Gelecekteki tüm özellikler"], cta: "Ömür boyu erişim al →", badge: "En iyi değer" },
    footerText: "© 2025 csreq. Daha iyi couch request mektupları yaz.",
  },
} as const;

const EXAMPLE_LETTERS = [
  {
    host: "Marco · Florence, Italy",
    tag: "Artist",
    preview: "Your profile stopped me — not because of the location, but because of what you wrote about watercolor and early morning light...",
    full: `Hi Marco,

Your profile stopped me — not because of the location, but because of what you wrote about watercolor and early morning light. I've been chasing that same quality of morning for two years with a camera, and there's something about how you described it that made me want to paint instead of photograph.

I'm Alex, traveling from Istanbul to Florence for a short photography project on the city's architecture and markets. I'm quiet in the mornings, keep things tidy, and genuinely enjoy conversations about how people see. Yours sounds like one worth having.

I'm hoping to stay June 12 to 15. I'd love to see your work if you're willing to share it.

Take care,
Alex`,
  },
  {
    host: "Kenji · Kyoto, Japan",
    tag: "Trail runner",
    preview: "I've been planning this Kyoto trip around the trails rather than the temples, so finding your profile felt like exactly the right kind of luck...",
    full: `Hi Kenji,

I've been planning this Kyoto trip around the trails rather than the temples, so finding your profile felt like exactly the right kind of luck. The section about your morning runs near Fushimi Inari — I've looked up those paths and I'm already mapping them in my head.

I'm Alex from Berlin, spending three weeks in the Kansai region mostly on foot. I wake up early, don't need much space, and genuinely prefer quiet evenings over going out. I think I'd be a low-maintenance guest.

I'm hoping to arrive July 8 and leave on the 10th. Happy to join you on a trail run if you're up for company that morning.

Hope to hear from you,
Alex`,
  },
  {
    host: "Claire · Lyon, France",
    tag: "Foodie",
    preview: "Your description of the Saturday market — knowing the vendors, choosing cheese by the rind — is exactly the reason I'm spending three days in Lyon...",
    full: `Hi Claire,

Your description of the Saturday market — knowing the vendors, choosing cheese by the rind — is exactly the reason I'm spending three days in Lyon and not just passing through.

I'm Alex from London, taking two weeks to travel slowly through France. I cook regularly at home and I tend to learn more about a place from its food than from anything else. Lyon has been on my list for two years.

I'm looking at September 3 to 5 if you have space. I'm quiet, keep things clean, and won't be in your way. If you happen to be cooking during the visit, I'd love to watch — no expectations beyond that.

Hope to hear from you,
Alex`,
  },
];

const FEATURES = [
  { icon: "✦", title: "Sounds human", body: "24 AI writing patterns blocked — no em dashes, no \"vibrant tapestries\", no rule of three." },
  { icon: "◎", title: "25 languages", body: "Write your letter in any language your host speaks. One click." },
  { icon: "⚑", title: "Host warnings", body: "Detects gender restrictions, nudism, minimum stays, and other important conditions before you write." },
  { icon: "⊡", title: "Your character limit", body: "Choose 600 to 1500 characters. CS's own limit is 995 — the tool knows." },
];

function LetterModal({ letter, host, onClose, copyLabel, copiedLabel, badge }: { letter: string; host: string; onClose: () => void; copyLabel: string; copiedLabel: string; badge: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modal = (
    <div
      className="animate-backdrop-in"
      style={{
        position: "fixed", inset: 0, zIndex: 9990,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        background: "rgba(8,8,8,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-modal-in"
        style={{
          width: "100%", maxWidth: "560px", position: "relative",
          background: "var(--color-surface)", border: "1px solid var(--color-edge-hi)",
          borderRadius: "24px", overflow: "hidden",
          maxHeight: "90dvh", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--color-edge)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: "0.68rem", color: "var(--color-amber)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, marginBottom: "2px" }}>{badge}</p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-ink)" }}>{host}</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={copy}
              style={{
                padding: "6px 14px", fontSize: "0.75rem", borderRadius: "100px",
                border: `1px solid ${copied ? "rgba(224,120,48,0.4)" : "var(--color-edge)"}`,
                background: copied ? "var(--color-amber-dim)" : "transparent",
                color: copied ? "var(--color-amber)" : "var(--color-ink-muted)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {copied ? copiedLabel : copyLabel}
            </button>
            <button
              onClick={onClose}
              style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(255,255,255,0.06)", border: "1px solid var(--color-edge)",
                color: "var(--color-ink-muted)", fontSize: "0.85rem",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "2rem 2.5rem 2.5rem", flexGrow: 1 }}>
          {/* Ruled paper */}
          <div style={{
            background: "var(--color-paper)", borderRadius: "16px",
            padding: "2rem 2.5rem", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, var(--color-paper-line) 27px, var(--color-paper-line) 28px)",
              backgroundPosition: "0 2rem", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: "2rem",
              width: "1px", background: "var(--color-paper-line)", opacity: 0.6, pointerEvents: "none",
            }} />
            <pre style={{
              fontFamily: "var(--font-mono)", fontSize: "0.875rem", lineHeight: 1.9,
              color: "var(--color-paper-ink)", whiteSpace: "pre-wrap", wordBreak: "break-word",
              position: "relative", paddingLeft: "1rem", margin: 0,
            }}>
              {letter}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}

export default function LandingPage() {
  const [openLetter, setOpenLetter] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<LandingLang>("TR");
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("csreq_theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    const savedLang = localStorage.getItem("csreq_app_lang") as LandingLang | null;
    if (savedLang === "TR" || savedLang === "EN") setLang(savedLang);
    else if (savedLang) setLang("EN");
  }, []);

  const lt = LT[lang] ?? LT.EN;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      glowRef.current?.style.setProperty("--gx", `${e.clientX}px`);
      glowRef.current?.style.setProperty("--gy", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const toggleTheme = (m: "dark" | "light") => {
    setTheme(m);
    document.documentElement.setAttribute("data-theme", m);
    localStorage.setItem("csreq_theme", m);
  };

  const toggleLang = (l: LandingLang) => {
    setLang(l);
    localStorage.setItem("csreq_app_lang", l);
  };

  return (
    <>
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(700px circle at var(--gx, -999px) var(--gy, -999px), var(--glow-color, rgba(224,120,48,0.055)), transparent 60%)",
        }}
      />

      {openLetter !== null && (
        <LetterModal
          letter={EXAMPLE_LETTERS[openLetter].full}
          host={EXAMPLE_LETTERS[openLetter].host}
          onClose={() => setOpenLetter(null)}
          copyLabel={lt.exCopy}
          copiedLabel={lt.exCopied}
          badge={lt.exModalBadge}
        />
      )}

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--color-edge)",
        background: "var(--color-nav-bg)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.25rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Logo size={36} spin={false} />
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.01em" }}>csreq</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className="hide-sm" style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)", borderRadius: "8px", padding: "2px", gap: "2px" }}>
              {(["dark", "light"] as const).map(m => (
                <button key={m} onClick={() => toggleTheme(m)} style={{
                  padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600,
                  border: "none", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s",
                  background: theme === m ? "var(--color-amber)" : "transparent",
                  color: theme === m ? "#fff" : "var(--color-ink-muted)",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  {m === "dark" ? `◗ ${lt.dark}` : `◖ ${lt.light}`}
                </button>
              ))}
            </div>
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)", borderRadius: "8px", padding: "2px", gap: "2px" }}>
              {(["TR", "EN"] as const).map(l => (
                <button key={l} onClick={() => toggleLang(l)} style={{
                  padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600,
                  border: "none", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s",
                  background: lang === l ? "var(--color-surface-2)" : "transparent",
                  color: lang === l ? "var(--color-ink)" : "var(--color-ink-muted)",
                }}>
                  {l}
                </button>
              ))}
            </div>
            <Link
              href="/app"
              style={{
                padding: "7px 16px", fontSize: "0.82rem", fontWeight: 600,
                background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                color: "#fff", borderRadius: "100px", textDecoration: "none",
                boxShadow: "0 2px 10px rgba(224,120,48,0.3)", transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {lt.tryFree}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem, 8vw, 6rem) 1.25rem clamp(2.5rem, 6vw, 5rem)" }}>
        <div className="animate-fade-up">
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "1rem", fontWeight: 500 }}>
            {lt.heroBadge}
          </p>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
            fontWeight: 300, color: "var(--color-ink)", lineHeight: 1.05,
            letterSpacing: "-0.025em", maxWidth: "680px", marginBottom: "1.5rem",
          }}>
            {lt.heroTitle}
            <em style={{ fontStyle: "italic", color: "var(--color-ink-muted)" }}>{lt.heroItalic}</em>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--color-ink-muted)", maxWidth: "460px", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            {lt.heroSub}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/app"
              style={{
                padding: "14px 28px", fontSize: "0.95rem", fontWeight: 600,
                background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                color: "#fff", borderRadius: "14px", textDecoration: "none",
                boxShadow: "0 4px 20px rgba(224,120,48,0.3)", transition: "all 0.2s", display: "inline-block",
              }}
            >
              {lt.tryFree}
            </Link>
            <span style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>
              {lt.heroFreeNote}
            </span>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* Example letters */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.exBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {lt.exTitle}
          </h2>
          <p style={{ color: "var(--color-ink-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            {lt.exSub}
          </p>
        </div>

        <div className="r-grid-3 swipe-cards">
          {EXAMPLE_LETTERS.map((ex, i) => (
            <button
              key={i}
              onClick={() => setOpenLetter(i)}
              style={{
                background: "var(--color-paper)", border: "1px solid var(--color-edge-hi)",
                borderRadius: "16px", padding: "1.5rem", textAlign: "left",
                cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; e.currentTarget.style.borderColor = "rgba(224,120,48,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "var(--color-edge-hi)"; }}
            >
              {/* Ruled lines */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "repeating-linear-gradient(transparent, transparent 22px, var(--color-paper-line) 22px, var(--color-paper-line) 23px)",
                backgroundPosition: "0 3.5rem", pointerEvents: "none", opacity: 0.6,
              }} />

              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "var(--color-amber)", background: "var(--color-amber-dim)",
                    border: "1px solid rgba(224,120,48,0.25)", padding: "2px 8px", borderRadius: "100px",
                  }}>{ex.tag}</span>
                  <span style={{ fontSize: "0.65rem", color: "var(--color-paper-ink)", opacity: 0.5 }}>Read →</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--color-paper-ink)", opacity: 0.7, marginBottom: "0.75rem", letterSpacing: "0.01em" }}>
                  To: {ex.host}
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", lineHeight: 1.8, color: "var(--color-paper-ink)", margin: 0 }}>
                  {ex.preview}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* How it works */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.howBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {lt.howTitle}
          </h2>
        </div>

        <div className="r-grid-steps">
          {lt.howSteps.map((step, i) => ({ ...step, n: ["01","02","03"][i] })).map(step => (
            <div key={step.n} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                border: "1px solid var(--color-edge)", background: "rgba(255,255,255,0.02)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-amber)", fontWeight: 600,
              }}>{step.n}</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 400, color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)", lineHeight: 1.7 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* Why not ChatGPT */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3.5rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.vsBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15, maxWidth: "600px" }}>
            {lt.vsTitle}
            <em style={{ fontStyle: "italic", color: "var(--color-ink-muted)" }}>{lt.vsItalic}</em>
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--color-ink-muted)", maxWidth: "520px", lineHeight: 1.75, marginTop: "1rem" }}>
            {lt.vsSub}
          </p>
        </div>

        <div className="r-grid-2 swipe-cards">
          {/* Card 1 */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{lt.vsProblem}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)" }}>{lt.vsCards[0].title}</h3>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{lt.vsCards[0].body}</p>
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--color-edge)", borderRadius: "12px", padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 0.4rem", color: "var(--color-ink-muted)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{lt.vsCards[0].listTitle}</p>
              {lt.vsCards[0].list.map(phrase => (
                <div key={phrase} style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(220,80,80,0.75)" }}>
                  <span style={{ fontSize: "0.6rem" }}>✕</span>
                  <span style={{ textDecoration: "line-through", opacity: 0.7 }}>{phrase}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{lt.vsProblem}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)" }}>{lt.vsCards[1].title}</h3>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{lt.vsCards[1].body}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(220,60,60,0.06)", border: "1px solid rgba(220,60,60,0.15)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                <span style={{ fontSize: "1.1rem" }}>✕</span>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "rgba(220,80,80,0.8)", fontWeight: 600, margin: "0 0 1px" }}>{lt.vsCards[1].badLabel}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", margin: 0 }}>{lt.vsCards[1].badText}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--color-amber-dim)", border: "1px solid rgba(224,120,48,0.2)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                <span style={{ color: "var(--color-amber)", fontSize: "1.1rem" }}>✓</span>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "var(--color-amber)", fontWeight: 600, margin: "0 0 1px" }}>{lt.vsCards[1].goodLabel}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", margin: 0 }}>{lt.vsCards[1].goodText}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{lt.vsProblem}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)" }}>{lt.vsCards[2].title}</h3>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{lt.vsCards[2].body1}</p>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7 }}>{lt.vsCards[2].body2}</p>
          </div>

          {/* Card 4 */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{lt.vsProblem}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)" }}>{lt.vsCards[3].title}</h3>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{lt.vsCards[3].body}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {lt.vsCards[3].warnings.map(w => (
                <div key={w} style={{ display: "flex", gap: "10px", alignItems: "center", background: "rgba(224,120,48,0.06)", border: "1px solid rgba(224,120,48,0.15)", borderRadius: "8px", padding: "0.6rem 0.9rem" }}>
                  <span style={{ color: "var(--color-amber)", fontSize: "0.85rem" }}>⚑</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>{w} {lt.vsCards[3].warnSuffix}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginTop: "1rem", lineHeight: 1.6 }}>{lt.vsCards[3].warnNote}</p>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* Features */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.featBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {lt.featTitle}
            <em style={{ fontStyle: "italic", color: "var(--color-ink-muted)" }}>{lt.featItalic}</em>
          </h2>
        </div>

        <div className="r-grid-2">
          {FEATURES.map(f => (
            <div key={f.title} style={{
              border: "1px solid var(--color-edge)", borderRadius: "16px",
              padding: "1.5rem", background: "rgba(255,255,255,0.015)",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-edge-hi)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-edge)")}
            >
              <div style={{ fontSize: "1.1rem", color: "var(--color-amber)", marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.4rem" }}>{f.title}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)", lineHeight: 1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* Pricing */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.pricBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {lt.pricTitle}
          </h2>
        </div>

        <div className="r-grid-pricing swipe-cards">
          {/* Free */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{lt.pricFree.label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.35rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--color-ink)" }}>{lt.pricFree.price}</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginBottom: "1.5rem" }}>{lt.pricFree.note}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
              {lt.pricFree.features.map(f => (
                <div key={f} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-amber)", fontSize: "0.7rem" }}>✓</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/app" style={{ display: "block", textAlign: "center", padding: "0.75rem", border: "1px solid var(--color-edge-hi)", borderRadius: "12px", color: "var(--color-ink)", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}>
              {lt.pricFree.cta}
            </Link>
          </div>

          {/* Monthly */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{lt.pricMonthly.label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.35rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--color-ink)" }}>{lt.pricMonthly.price}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>{lt.pricMonthly.per}</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginBottom: "1.5rem" }}>{lt.pricMonthly.note}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
              {lt.pricMonthly.features.map(f => (
                <div key={f} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-amber)", fontSize: "0.7rem" }}>✓</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/app" style={{ display: "block", textAlign: "center", padding: "0.75rem", border: "1px solid var(--color-edge-hi)", borderRadius: "12px", color: "var(--color-ink)", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}>
              {lt.pricMonthly.cta}
            </Link>
          </div>

          {/* Lifetime */}
          <div style={{ border: "1px solid rgba(224,120,48,0.45)", borderRadius: "20px", padding: "1.75rem", background: "var(--color-amber-dim)", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)", color: "#fff", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 12px", borderRadius: "100px", boxShadow: "0 2px 8px rgba(224,120,48,0.4)", whiteSpace: "nowrap" }}>
              {lt.pricLifetime.badge}
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--color-amber)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>{lt.pricLifetime.label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.35rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--color-ink)" }}>{lt.pricLifetime.price}</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginBottom: "1.5rem" }}>{lt.pricLifetime.note}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
              {lt.pricLifetime.features.map(f => (
                <div key={f} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-amber)", fontSize: "0.7rem" }}>✓</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/app" style={{ display: "block", textAlign: "center", padding: "0.75rem", background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)", borderRadius: "12px", color: "#fff", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 3px 12px rgba(224,120,48,0.3)", transition: "all 0.2s" }}>
              {lt.pricLifetime.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--color-edge)", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 500, color: "var(--color-ink-muted)" }}>csreq</span>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)" }}>{lt.footerText}</p>
        </div>
      </footer>
    </>
  );
}
