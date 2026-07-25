"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/prompts";
import { translations, LANGS, type Lang } from "@/lib/i18n";
import AuthModal from "@/components/AuthModal";
import UserProfileSetup from "@/components/UserProfileSetup";
import HostProfileInput from "@/components/HostProfileInput";
import StayDates from "@/components/StayDates";
import LanguageToggle from "@/components/LanguageToggle";
import LetterOutput from "@/components/LetterOutput";
import SpotlightCard from "@/components/SpotlightCard";
import VerifyWall from "@/components/VerifyWall";
import InfoModal from "@/components/InfoModal";
import PaywallModal from "@/components/PaywallModal";
import Logo from "@/components/Logo";

const FREE_LIMIT = 5;

type AuthUser = {
  id: string; email: string; emailVerified: boolean; profile: UserProfile | null;
  lettersUsed?: number; isPro?: boolean;
};

export default function Page() {
  return <Suspense><PageInner /></Suspense>;
}

function PageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined);
  const [showSetup, setShowSetup] = useState(false);
  const [appLang, setAppLang] = useState<Lang>("EN");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hostText, setHostText] = useState("");
  const [hostHomeText, setHostHomeText] = useState("");
  const [hostRefsText, setHostRefsText] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [language, setLanguage] = useState<string>("EN");
  const [charLimit, setCharLimit] = useState(980);
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showAuth, setShowAuth] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [lettersUsed, setLettersUsed] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[appLang];

  const verifiedParam = searchParams.get("verified") as "ok" | "expired" | null;
  const pendingSession = searchParams.get("pending_session");

  const initialPendingRef = useRef(pendingSession);
  const glowRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      glowRef.current?.style.setProperty("--gx", `${e.clientX}px`);
      glowRef.current?.style.setProperty("--gy", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const applyUser = (data: { user: AuthUser | null }) => {
    if (data.user) {
      setAuthUser(data.user);
      setLettersUsed(data.user.lettersUsed ?? 0);
      if (data.user.profile) setUserProfile(data.user.profile);
      else setShowSetup(true);
    } else {
      setAuthUser(null);
    }
  };

  useEffect(() => {
    const lang = localStorage.getItem("csreq_app_lang") as Lang | null;
    if (lang && LANGS.some(l => l.code === lang)) setAppLang(lang);
    const savedTheme = localStorage.getItem("csreq_theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    if (initialPendingRef.current) return;

    fetch("/api/auth/me").then(r => r.json()).then(data => {
      applyUser(data);
      if (!data.user) {
        try {
          const saved = localStorage.getItem("csreq_guest_profile");
          if (saved) setUserProfile(JSON.parse(saved));
        } catch {}
        const guestUsed = parseInt(localStorage.getItem("csreq_letters_used") || "0", 10);
        setLettersUsed(guestUsed);
        setShowInfoModal(true);
      }
    });
  }, []);

  useEffect(() => {
    const token = initialPendingRef.current;
    if (!token) return;

    fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(async (exchangeData) => {
        if (exchangeData.success) {
          const meData = await fetch("/api/auth/me").then(r => r.json());
          applyUser(meData);
        } else {
          setAuthUser(null);
        }
      })
      .catch(() => setAuthUser(null))
      .finally(() => {
        router.replace("/app");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuthSuccess = async () => {
    const data = await fetch("/api/auth/me").then(r => r.json());
    applyUser(data);
    setShowAuth(false);
    setShowInfoModal(false);
    setShowPaywall(false);
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowSetup(false);
    if (!authUser) {
      localStorage.setItem("csreq_guest_profile", JSON.stringify(profile));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null);
    setUserProfile(null);
    setLetter("");
    setLettersUsed(0);
  };

  const handleDeleteAccount = async () => {
    await fetch("/api/auth/delete-account", { method: "DELETE" });
    setAuthUser(null);
    setUserProfile(null);
    setLetter("");
    setLettersUsed(0);
  };

  const generate = async () => {
    if (!userProfile || !hostText.trim() || !checkIn || !checkOut) return;

    // Guest limit check (client-side gate)
    if (!authUser) {
      const guestUsed = parseInt(localStorage.getItem("csreq_letters_used") || "0", 10);
      if (guestUsed >= FREE_LIMIT) {
        setLettersUsed(guestUsed);
        setShowPaywall(true);
        return;
      }
    }

    setLoading(true);
    setError("");
    setLetter("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, hostProfileText: hostText, hostHomeText, hostRefsText, checkIn, checkOut, language, charLimit }),
      });
      const data = await res.json();

      if (res.status === 402 && data.error === "limit_reached") {
        setLettersUsed(data.lettersUsed ?? FREE_LIMIT);
        setShowPaywall(true);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Error");

      setLetter(data.letter);

      // Increment guest counter
      if (!authUser) {
        const guestUsed = parseInt(localStorage.getItem("csreq_letters_used") || "0", 10);
        const newCount = guestUsed + 1;
        localStorage.setItem("csreq_letters_used", String(newCount));
        setLettersUsed(newCount);
      } else {
        // Optimistic update for logged-in users
        if (!authUser.isPro) {
          setLettersUsed(prev => prev + 1);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = !!userProfile && hostText.trim().length > 20 && !!checkIn && !!checkOut;

  if (authUser === undefined) return null;

  if (authUser && !authUser.emailVerified) {
    return (
      <VerifyWall
        t={t}
        email={authUser.email}
        onVerified={handleAuthSuccess}
        onLogout={handleLogout}
      />
    );
  }

  const isGuest = !authUser;
  const isPro = authUser?.isPro ?? false;
  const remainingFree = isPro ? null : Math.max(0, FREE_LIMIT - lettersUsed);

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

      {showAuth && (
        <AuthModal t={t} onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} verifyBanner={verifiedParam} />
      )}

      {showInfoModal && !authUser && (
        <InfoModal t={t} onClose={() => setShowInfoModal(false)} onSignIn={() => setShowAuth(true)} />
      )}

      {showSetup && (
        <UserProfileSetup
          t={t}
          onSave={handleSaveProfile}
          onClose={() => setShowSetup(false)}
          onDeleteAccount={authUser ? handleDeleteAccount : undefined}
          initial={userProfile}
          userId={authUser?.id}
        />
      )}

      {showPaywall && (
        <PaywallModal
          t={t}
          onClose={() => setShowPaywall(false)}
          onSignIn={() => { setShowPaywall(false); setShowAuth(true); }}
          isGuest={isGuest}
          lettersUsed={lettersUsed}
        />
      )}

      {/* Nav */}
      <nav className="animate-nav" style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--color-edge)",
        background: "var(--color-nav-bg)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        transition: "background 0.3s",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.25rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}>
            <Logo size={36} spin={false} />
            <span className="hide-sm" style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.01em" }}>csreq</span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
            {/* Free letter counter for guests */}
            {isGuest && !isPro && remainingFree !== null && remainingFree <= 2 && (
              <div className="hide-sm" style={{
                padding: "4px 10px", fontSize: "0.7rem", flexShrink: 0,
                border: "1px solid var(--color-edge)", borderRadius: "100px",
                color: remainingFree === 0 ? "#e07070" : "var(--color-ink-muted)",
                background: remainingFree === 0 ? "rgba(220,60,60,0.06)" : "transparent",
              }}>
                {remainingFree === 0 ? "No free letters left" : `${remainingFree} left`}
              </div>
            )}

            <div className="hide-sm" style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)", borderRadius: "8px", padding: "2px", gap: "2px", flexShrink: 0 }}>
              {(["dark", "light"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setTheme(m); document.documentElement.setAttribute("data-theme", m); localStorage.setItem("csreq_theme", m); }}
                  style={{
                    padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600,
                    border: "none", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s",
                    background: theme === m ? "var(--color-amber)" : "transparent",
                    color: theme === m ? "#fff" : "var(--color-ink-muted)",
                    display: "flex", alignItems: "center", gap: "4px",
                  }}
                >
                  {m === "dark" ? "◗" : "◖"} {m === "dark" ? (appLang === "TR" ? "Koyu" : "Dark") : (appLang === "TR" ? "Açık" : "Light")}
                </button>
              ))}
            </div>

            <select
              value={appLang}
              onChange={e => { setAppLang(e.target.value as Lang); localStorage.setItem("csreq_app_lang", e.target.value); }}
              style={{
                padding: "4px 8px", fontSize: "0.72rem", fontWeight: 600,
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)",
                borderRadius: "8px", color: "var(--color-ink-muted)", cursor: "pointer", outline: "none", flexShrink: 0,
              }}
            >
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>

            {authUser ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px 6px 8px",
                    border: "1px solid var(--color-edge)", borderRadius: "100px",
                    background: showUserMenu ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                    color: "var(--color-ink-muted)", fontSize: "0.8rem",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-edge-hi)"; e.currentTarget.style.color = "var(--color-ink)"; }}
                  onMouseLeave={e => { if (!showUserMenu) { e.currentTarget.style.borderColor = "var(--color-edge)"; e.currentTarget.style.color = "var(--color-ink-muted)"; } }}
                >
                  <span style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "var(--color-amber-dim)", border: "1px solid rgba(224,120,48,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", fontWeight: 600, color: "var(--color-amber)", flexShrink: 0,
                  }}>
                    {(userProfile?.name || authUser.email).charAt(0).toUpperCase()}
                  </span>
                  <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userProfile?.name || authUser.email.split("@")[0]}
                  </span>
                  <span style={{ fontSize: "0.6rem", opacity: 0.5, marginLeft: "-2px" }}>▾</span>
                </button>

                {showUserMenu && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: "180px",
                    background: "var(--color-surface)", border: "1px solid var(--color-edge-hi)",
                    borderRadius: "12px", overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    animation: "modal-in 0.15s ease",
                    zIndex: 100,
                  }}>
                    <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-edge)" }}>
                      <p style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {authUser.email}
                      </p>
                      {isPro && (
                        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--color-amber)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          PRO
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "0.4rem" }}>
                      <button
                        onClick={() => { setShowUserMenu(false); setShowSetup(true); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "0.55rem 0.75rem",
                          fontSize: "0.82rem", color: "var(--color-ink-muted)",
                          background: "transparent", border: "none", borderRadius: "8px",
                          cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "8px",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--color-ink)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-ink-muted)"; }}
                      >
                        ⚙ Account settings
                      </button>
                      {!isPro && (
                        <button
                          onClick={() => { setShowUserMenu(false); setShowPaywall(true); }}
                          style={{
                            width: "100%", textAlign: "left", padding: "0.55rem 0.75rem",
                            fontSize: "0.82rem", color: "var(--color-amber)",
                            background: "transparent", border: "none", borderRadius: "8px",
                            cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "8px",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-amber-dim)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                          ✦ Upgrade to Pro
                        </button>
                      )}
                      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0.4rem 0" }} />
                      <button
                        onClick={() => { setShowUserMenu(false); handleLogout(); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "0.55rem 0.75rem",
                          fontSize: "0.82rem", color: "var(--color-ink-muted)",
                          background: "transparent", border: "none", borderRadius: "8px",
                          cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "8px",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,60,60,0.08)"; e.currentTarget.style.color = "#e07070"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-ink-muted)"; }}
                      >
                        ↪ Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  padding: "6px 16px", border: "1px solid var(--color-edge)", borderRadius: "100px",
                  background: "rgba(255,255,255,0.04)", color: "var(--color-ink-muted)",
                  fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-amber)"; e.currentTarget.style.color = "var(--color-amber)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-edge)"; e.currentTarget.style.color = "var(--color-ink-muted)"; }}
              >
                {t.navLoginBtn}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.25rem" }}>
        <div className="animate-fade-up" style={{ padding: "clamp(2rem,5vw,4rem) 0 clamp(1.5rem,4vw,3rem)" }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.75rem", fontWeight: 500 }}>
            {t.couchRequest}
          </p>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 300, color: "var(--color-ink)", lineHeight: 1.1,
            letterSpacing: "-0.02em", maxWidth: "500px",
          }}>
            {t.tagline}<br />
            <em style={{ fontStyle: "italic", color: "var(--color-ink-muted)" }}>{t.taglineItalic}</em>
          </h1>
        </div>

        <div className="animate-fade-up delay-1" style={{ height: "1px", background: "var(--color-edge)", marginBottom: "2.5rem" }} />

        <div className="animate-fade-up delay-2 app-layout">
          <SpotlightCard className="card card-lift" style={{ padding: "1.75rem" }}>
            <HostProfileInput
              t={t} value={hostText} onChange={setHostText}
              homeValue={hostHomeText} onHomeChange={setHostHomeText}
              refsValue={hostRefsText} onRefsChange={setHostRefsText}
              userGender={userProfile?.gender}
            />
          </SpotlightCard>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="card card-lift" style={{ padding: "1.75rem", position: "relative", zIndex: 10 }}>
              <StayDates t={t} checkIn={checkIn} checkOut={checkOut} onCheckIn={setCheckIn} onCheckOut={setCheckOut} />
            </div>
            <SpotlightCard className="card" style={{ padding: "1.25rem 1.75rem" }}>
              <LanguageToggle t={t} appLang={appLang} value={language} onChange={setLanguage} />
            </SpotlightCard>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "0.68rem", color: "var(--color-ink-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {t.charLimitLabel}
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--color-ink-muted)" }}>
                  {t.charLimitNote}
                </span>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {[600, 800, 980, 1200, 1500].map(n => (
                  <button
                    key={n}
                    onClick={() => setCharLimit(n)}
                    style={{
                      flex: 1, padding: "5px 2px", fontSize: "0.7rem", borderRadius: "6px",
                      border: `1px solid ${charLimit === n ? "rgba(224,120,48,0.5)" : "var(--color-edge)"}`,
                      background: charLimit === n ? "var(--color-amber-dim)" : "transparent",
                      color: charLimit === n ? "var(--color-amber)" : "var(--color-ink-muted)",
                      cursor: "pointer", transition: "all 0.15s", fontWeight: charLimit === n ? 600 : 400,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!canGenerate || loading}
              className={canGenerate && !loading ? "btn-press" : ""}
              style={{
                width: "100%", padding: "15px",
                background: canGenerate && !loading
                  ? "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)"
                  : "rgba(255,255,255,0.05)",
                color: canGenerate && !loading ? "#fff" : "var(--color-ink-muted)",
                border: canGenerate && !loading ? "none" : "1px solid var(--color-edge)",
                borderRadius: "14px", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.03em",
                cursor: canGenerate && !loading ? "pointer" : "not-allowed", transition: "all 0.25s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: canGenerate && !loading ? "0 4px 20px rgba(224,120,48,0.28), inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
                animation: canGenerate && !loading ? "amber-pulse 2.4s ease-in-out infinite" : "none",
              }}
              onMouseEnter={e => { if (canGenerate && !loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.animationPlayState = "paused"; } }}
              onMouseLeave={e => { if (canGenerate && !loading) { e.currentTarget.style.transform = "none"; e.currentTarget.style.animationPlayState = "running"; } }}
            >
              {loading ? (
                <><Logo size={22} spin={true} />{t.writing}</>
              ) : t.writeLetter}
            </button>

            {!canGenerate && !loading && (
              <p style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", textAlign: "center", margin: "-0.5rem 0 0" }}>
                {!userProfile
                  ? <button onClick={() => setShowSetup(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-amber)", fontSize: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>{t.setupTitle} →</button>
                  : !hostText.trim() ? t.needProfile
                  : (!checkIn || !checkOut) ? t.needDates
                  : ""}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="animate-fade-up" style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "rgba(220,60,60,0.06)", border: "1px solid rgba(220,60,60,0.18)", borderRadius: "12px", fontSize: "0.82rem", color: "#e07070" }}>
            {error}
          </div>
        )}

        {letter && (
          <div style={{ marginTop: "3rem", paddingBottom: "5rem" }}>
            <div style={{ height: "1px", background: "var(--color-edge)", marginBottom: "2.5rem" }} />
            <LetterOutput t={t} letter={letter} charLimit={charLimit} />
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
