"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { T } from "@/lib/i18n";

type Props = {
  t: T;
  onSuccess: (email: string) => void;
  onClose?: () => void;
  verifyBanner?: "ok" | "expired" | null;
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function AuthModal({ t, onSuccess, onClose, verifyBanner }: Props) {
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (tab === "forgot") {
        await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        setForgotSent(true);
        setLoading(false);
        return;
      }
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Bir hata oluştu"); return; }
      onSuccess(data.email);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: "0.875rem",
    background: "var(--color-surface-2)", border: "1px solid var(--color-edge)",
    borderRadius: "10px", color: "var(--color-ink)", outline: "none",
    transition: "border-color 0.2s", fontFamily: "var(--font-sans)",
    boxSizing: "border-box",
  };

  const modal = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9990,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        background: "rgba(8,8,8,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={e => { if (e.target === e.currentTarget && onClose) onClose(); }}
    >
      <div
        className="animate-modal-in"
        style={{ width: "100%", maxWidth: "384px", position: "relative", background: "var(--color-surface)", border: "1px solid var(--color-edge-hi)", borderRadius: "20px", padding: "2rem" }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute", top: "1rem", right: "1rem",
              width: "28px", height: "28px", borderRadius: "50%",
              background: "rgba(255,255,255,0.06)", border: "1px solid var(--color-edge)",
              color: "var(--color-ink-muted)", fontSize: "0.85rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--color-ink)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--color-ink-muted)"; }}
          >
            ✕
          </button>
        )}

        {verifyBanner === "ok" && (
          <div style={{ background: "rgba(52,168,83,0.1)", border: "1px solid rgba(52,168,83,0.3)", borderRadius: "10px", padding: "10px 14px", marginBottom: "1.25rem", fontSize: "0.78rem", color: "#4caf74" }}>
            ✓ {t.authVerifySuccess}
          </div>
        )}
        {verifyBanner === "expired" && (
          <div style={{ background: "rgba(220,60,60,0.08)", border: "1px solid rgba(220,60,60,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "1.25rem", fontSize: "0.78rem", color: "#e07070" }}>
            {t.authVerifyExpired}
          </div>
        )}

        {/* Logo */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-ink)", marginBottom: "0.3rem" }}>csreq</p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>
            {tab === "login" ? t.authLoginSubtitle : tab === "register" ? t.authRegisterSubtitle : t.authForgotTitle}
          </p>
        </div>

        {/* Forgot password view */}
        {tab === "forgot" ? (
          <div>
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); setForgotSent(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-ink-muted)", fontSize: "0.8rem", padding: "0 0 1rem", display: "flex", alignItems: "center", gap: "4px" }}
            >
              {t.authForgotBack}
            </button>
            {forgotSent ? (
              <div style={{ background: "rgba(52,168,83,0.1)", border: "1px solid rgba(52,168,83,0.3)", borderRadius: "10px", padding: "14px 16px", fontSize: "0.82rem", color: "#4caf74", lineHeight: 1.5 }}>
                ✓ {t.authForgotSent}
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)", margin: "0 0 0.5rem", lineHeight: 1.5 }}>{t.authForgotDesc}</p>
                <input
                  type="email" placeholder="ornek@email.com" value={email} required autoFocus
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--color-amber)")}
                  onBlur={e => (e.target.style.borderColor = "var(--color-edge)")}
                />
                <button
                  type="submit" disabled={loading}
                  style={{
                    padding: "0.8rem",
                    background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                    color: loading ? "var(--color-ink-muted)" : "#fff",
                    fontWeight: 600, fontSize: "0.875rem",
                    border: "none", borderRadius: "12px",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                >
                  {loading ? <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />{t.authLoading}</> : t.authForgotBtn}
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Google button */}
            <a
              href="/api/auth/google"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                width: "100%", padding: "10px 16px",
                background: "#fff", color: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px",
                fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
                textDecoration: "none", transition: "opacity 0.15s",
                boxSizing: "border-box",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <GoogleIcon />
              {t.authGoogleBtn}
            </a>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "1.25rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--color-edge)" }} />
              <span style={{ fontSize: "0.7rem", color: "var(--color-ink-muted)", letterSpacing: "0.05em" }}>{t.authOrDivider}</span>
              <div style={{ flex: 1, height: "1px", background: "var(--color-edge)" }} />
            </div>

            {/* Tab switcher */}
            <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)", borderRadius: "10px", padding: "3px", marginBottom: "1.25rem" }}>
              {(["login", "register"] as const).map(s => (
                <button key={s} type="button" onClick={() => { setTab(s); setError(""); }}
                  style={{
                    flex: 1, padding: "7px", fontSize: "0.78rem", fontWeight: 600,
                    border: "none", borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
                    background: tab === s ? "var(--color-surface-2)" : "transparent",
                    color: tab === s ? "var(--color-ink)" : "var(--color-ink-muted)",
                    boxShadow: tab === s ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                  }}
                >
                  {s === "login" ? t.authLoginTab : t.authRegisterTab}
                </button>
              ))}
            </div>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, marginBottom: "0.35rem" }}>
                  {t.authEmail}
                </label>
                <input
                  type="email" placeholder="ornek@email.com" value={email} required autoFocus
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--color-amber)")}
                  onBlur={e => (e.target.style.borderColor = "var(--color-edge)")}
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
                  <label style={{ display: "block", fontSize: "0.68rem", color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
                    {t.authPassword}
                  </label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => { setTab("forgot"); setError(""); setForgotSent(false); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.7rem", color: "var(--color-ink-muted)", padding: 0, textDecoration: "underline", textUnderlineOffset: "2px" }}
                    >
                      {t.authForgotLink}
                    </button>
                  )}
                </div>
                <input
                  type="password" value={password} required
                  placeholder={tab === "register" ? t.authPasswordHint : "••••••••"}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--color-amber)")}
                  onBlur={e => (e.target.style.borderColor = "var(--color-edge)")}
                />
              </div>

              {error && (
                <p style={{ fontSize: "0.75rem", color: "#e07070", margin: 0, padding: "8px 12px", background: "rgba(220,60,60,0.08)", borderRadius: "8px" }}>
                  {error}
                </p>
              )}

              <button
                type="submit" disabled={loading}
                style={{
                  marginTop: "0.15rem", padding: "0.8rem",
                  background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                  color: loading ? "var(--color-ink-muted)" : "#fff",
                  fontWeight: 600, fontSize: "0.875rem",
                  border: "none", borderRadius: "12px",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(224,120,48,0.3)",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {loading ? (
                  <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />{t.authLoading}</>
                ) : tab === "login" ? t.authLoginBtn : t.authRegisterBtn}
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
