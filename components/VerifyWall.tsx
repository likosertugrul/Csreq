"use client";

import { useState, useRef } from "react";
import type { T } from "@/lib/i18n";

type Props = {
  t: T;
  email: string;
  onVerified: () => void;
  onLogout: () => void;
};

export default function VerifyWall({ t, email, onVerified, onLogout }: Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const fullCode = code.join("");

  const handleInput = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    setError("");
    if (digit && i < 5) inputs.current[i + 1]?.focus();
    if (!digit && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = [...code];
    for (let i = 0; i < 6; i++) next[i] = digits[i] ?? "";
    setCode(next);
    setError("");
    inputs.current[Math.min(digits.length, 5)]?.focus();
  };

  const verify = async () => {
    if (fullCode.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.authVerifyInvalidCode); return; }
      onVerified();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResent(false);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
    setCode(["", "", "", "", "", ""]);
    setError("");
    setTimeout(() => { inputs.current[0]?.focus(); }, 50);
    setTimeout(() => setResent(false), 4000);
  };

  const cellStyle = (filled: boolean, focused: boolean): React.CSSProperties => ({
    width: "48px",
    height: "58px",
    borderRadius: "12px",
    border: `1.5px solid ${error ? "rgba(220,60,60,0.5)" : focused ? "var(--color-amber)" : filled ? "var(--color-edge-hi)" : "var(--color-edge)"}`,
    background: filled ? "rgba(224,120,48,0.06)" : "rgba(255,255,255,0.03)",
    color: "var(--color-ink)",
    fontSize: "1.6rem",
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    textAlign: "center",
    outline: "none",
    transition: "border-color 0.15s, background 0.15s",
    caretColor: "var(--color-amber)",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(8,8,8,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}
    >
      <div
        className="w-full max-w-sm animate-fade-up"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-edge-hi)", borderRadius: "20px", padding: "2rem", textAlign: "center" }}
      >
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: "var(--color-amber-dim)", border: "1px solid rgba(224,120,48,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem", fontSize: "1.4rem",
        }}>
          ✉
        </div>

        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 400, color: "var(--color-ink)", marginBottom: "0.5rem" }}>
          {t.authVerifyTitle}
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
          {t.authVerifyDesc}
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--color-amber)", marginBottom: "1.75rem" }}>
          {email}
        </p>

        {/* 6-digit input */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "1.25rem" }}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoFocus={i === 0}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={cellStyle(!!digit, false)}
              onFocus={e => (e.target.style.borderColor = "var(--color-amber)")}
              onBlur={e => (e.target.style.borderColor = error ? "rgba(220,60,60,0.5)" : digit ? "var(--color-edge-hi)" : "var(--color-edge)")}
            />
          ))}
        </div>

        {error && (
          <p style={{ fontSize: "0.75rem", color: "#e07070", marginBottom: "1rem", padding: "8px 12px", background: "rgba(220,60,60,0.08)", borderRadius: "8px" }}>
            {error}
          </p>
        )}

        <button
          onClick={verify}
          disabled={fullCode.length < 6 || loading}
          style={{
            width: "100%", padding: "0.75rem",
            background: fullCode.length === 6 && !loading
              ? "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)"
              : "rgba(255,255,255,0.05)",
            color: fullCode.length === 6 && !loading ? "#fff" : "var(--color-ink-muted)",
            border: "none", borderRadius: "12px",
            fontSize: "0.875rem", fontWeight: 600,
            cursor: fullCode.length === 6 && !loading ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: fullCode.length === 6 && !loading ? "0 4px 16px rgba(224,120,48,0.3)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {loading ? (
            <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />Doğrulanıyor...</>
          ) : t.authVerifyCodeBtn}
        </button>

        <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <button
            onClick={resend}
            style={{ fontSize: "0.75rem", color: resent ? "var(--color-amber)" : "var(--color-ink-muted)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
          >
            {resent ? t.authVerifyResent : t.authVerifyResend}
          </button>
          <span style={{ color: "var(--color-edge-hi)", fontSize: "0.7rem" }}>·</span>
          <button
            onClick={onLogout}
            style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)", background: "none", border: "none", cursor: "pointer" }}
          >
            {t.authVerifyLogout}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
