"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  onClose: () => void;
  onSignIn: () => void;
  isGuest: boolean;
  lettersUsed: number;
};

export default function PaywallModal({ onClose, onSignIn, isGuest, lettersUsed }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "lifetime" | null>(null);
  const [error, setError] = useState("");

  const checkout = async (plan: "monthly" | "lifetime") => {
    setLoadingPlan(plan);
    setError("");
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === "Payment not configured yet"
          ? "Payment coming soon — check back shortly."
          : "Something went wrong. Try again.");
        return;
      }
      window.open(data.url, "_blank");
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoadingPlan(null);
    }
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
          width: "100%", maxWidth: "420px", position: "relative",
          background: "var(--color-surface)", border: "1px solid var(--color-edge-hi)",
          borderRadius: "24px", padding: "2rem", overflow: "hidden",
        }}
      >
        {/* Amber glow top */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "200px", height: "1px",
          background: "linear-gradient(90deg, transparent, var(--color-amber), transparent)",
        }} />

        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "1rem", right: "1rem",
            width: "28px", height: "28px", borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", border: "1px solid var(--color-edge)",
            color: "var(--color-ink-muted)", fontSize: "0.85rem",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>

        {/* Usage indicator */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  width: "28px", height: "4px", borderRadius: "2px",
                  background: i < lettersUsed ? "var(--color-amber)" : "var(--color-edge)",
                  transition: "background 0.2s",
                }} />
              ))}
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)" }}>
              {lettersUsed}/5 free letters used
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: 400, color: "var(--color-ink)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            You've used your free letters.
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)", marginTop: "0.4rem", lineHeight: 1.6 }}>
            {isGuest
              ? "Create a free account to continue, then pick a plan."
              : "Upgrade to keep writing personalized couch request letters."}
          </p>
        </div>

        {isGuest ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={onSignIn}
              style={{
                width: "100%", padding: "0.85rem",
                background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                color: "#fff", fontWeight: 600, fontSize: "0.9rem",
                border: "none", borderRadius: "12px", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(224,120,48,0.3)", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
            >
              Create free account →
            </button>
            <p style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", textAlign: "center" }}>
              Free account required before upgrading
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Lifetime — recommended */}
            <div style={{
              border: "1px solid rgba(224,120,48,0.4)", borderRadius: "14px",
              padding: "1.25rem", position: "relative",
              background: "var(--color-amber-dim)",
            }}>
              <div style={{
                position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
                background: "var(--color-amber)", color: "#fff",
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "2px 10px", borderRadius: "100px",
              }}>Recommended</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--color-ink)" }}>Lifetime</span>
                <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-amber)" }}>$25</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)", marginBottom: "0.85rem", lineHeight: 1.5 }}>
                Unlimited letters, forever. One payment, no subscriptions.
              </p>
              <button
                onClick={() => checkout("lifetime")}
                disabled={!!loadingPlan}
                style={{
                  width: "100%", padding: "0.7rem",
                  background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                  color: "#fff", fontWeight: 600, fontSize: "0.85rem",
                  border: "none", borderRadius: "10px",
                  cursor: loadingPlan ? "not-allowed" : "pointer",
                  boxShadow: "0 3px 12px rgba(224,120,48,0.3)", transition: "all 0.2s",
                  opacity: loadingPlan && loadingPlan !== "lifetime" ? 0.5 : 1,
                }}
              >
                {loadingPlan === "lifetime" ? "Opening checkout..." : "Get lifetime access →"}
              </button>
            </div>

            {/* Monthly */}
            <div style={{ border: "1px solid var(--color-edge)", borderRadius: "14px", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--color-ink)" }}>Monthly</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-ink)" }}>$5</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)" }}>/mo</span>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)", marginBottom: "0.85rem", lineHeight: 1.5 }}>
                Unlimited letters. Cancel anytime.
              </p>
              <button
                onClick={() => checkout("monthly")}
                disabled={!!loadingPlan}
                style={{
                  width: "100%", padding: "0.7rem",
                  background: "transparent", color: "var(--color-ink)", fontWeight: 500, fontSize: "0.85rem",
                  border: "1px solid var(--color-edge-hi)", borderRadius: "10px",
                  cursor: loadingPlan ? "not-allowed" : "pointer", transition: "all 0.2s",
                  opacity: loadingPlan && loadingPlan !== "monthly" ? 0.5 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-amber)"; e.currentTarget.style.color = "var(--color-amber)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-edge-hi)"; e.currentTarget.style.color = "var(--color-ink)"; }}
              >
                {loadingPlan === "monthly" ? "Opening checkout..." : "Subscribe monthly →"}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: "0.75rem", color: "#e07070", textAlign: "center" }}>{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
