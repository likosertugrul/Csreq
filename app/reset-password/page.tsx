"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Page() {
  return <Suspense><ResetPasswordInner /></Suspense>;
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#e07070", marginBottom: "1rem" }}>Geçersiz link.</p>
          <a href="/app" style={{ color: "var(--color-amber)", textDecoration: "none", fontSize: "0.875rem" }}>← Uygulamaya dön</a>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("En az 6 karakter gir."); return; }
    if (password !== confirm) { setError("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Bir hata oluştu."); return; }
      setDone(true);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: "0.875rem",
    background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)",
    borderRadius: "10px", color: "var(--color-ink)", outline: "none",
    transition: "border-color 0.2s", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{
        width: "100%", maxWidth: "384px",
        background: "var(--color-surface)", border: "1px solid var(--color-edge-hi)",
        borderRadius: "20px", padding: "2rem",
      }}>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-ink)", marginBottom: "0.3rem" }}>csreq</p>
        <p style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)", marginBottom: "1.75rem" }}>Yeni şifre belirle</p>

        {done ? (
          <div>
            <div style={{ background: "rgba(52,168,83,0.1)", border: "1px solid rgba(52,168,83,0.3)", borderRadius: "10px", padding: "14px 16px", fontSize: "0.82rem", color: "#4caf74", marginBottom: "1.25rem" }}>
              ✓ Şifren güncellendi. Artık giriş yapabilirsin.
            </div>
            <button
              onClick={() => router.push("/app")}
              style={{
                width: "100%", padding: "0.8rem",
                background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                color: "#fff", fontWeight: 600, fontSize: "0.875rem",
                border: "none", borderRadius: "12px", cursor: "pointer",
              }}
            >
              Giriş yap →
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, marginBottom: "0.35rem" }}>
                Yeni Şifre
              </label>
              <input
                type="password" value={password} required placeholder="En az 6 karakter"
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "var(--color-amber)")}
                onBlur={e => (e.target.style.borderColor = "var(--color-edge)")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, marginBottom: "0.35rem" }}>
                Şifre Tekrar
              </label>
              <input
                type="password" value={confirm} required placeholder="••••••••"
                onChange={e => setConfirm(e.target.value)}
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
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {loading ? (
                <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />Güncelleniyor...</>
              ) : "Şifremi Güncelle →"}
            </button>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
