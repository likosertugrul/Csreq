"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { T } from "@/lib/i18n";

type Props = {
  t: T;
  onClose: () => void;
  onSignIn: () => void;
};

export default function InfoModal({ t, onClose, onSignIn }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const modal = (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(8,8,8,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        className="animate-modal-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "380px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-edge-hi)",
          borderRadius: "20px",
          padding: "1.75rem",
        }}
      >
        {/* Close button */}
        <button
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

        {/* Icon */}
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: "var(--color-amber-dim)", border: "1px solid rgba(224,120,48,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem", marginBottom: "1.1rem",
        }}>
          ✈
        </div>

        <h2 style={{
          fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 400,
          color: "var(--color-ink)", lineHeight: 1.25, marginBottom: "0.6rem",
        }}>
          {t.infoModalTitle}
        </h2>
        <p style={{
          fontSize: "0.82rem", color: "var(--color-ink-muted)", lineHeight: 1.65,
          marginBottom: "1.5rem",
        }}>
          {t.infoModalBody}
        </p>

        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            onClick={() => { onClose(); onSignIn(); }}
            style={{
              flex: 1, padding: "0.7rem",
              background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
              color: "#fff", fontWeight: 600, fontSize: "0.85rem",
              border: "none", borderRadius: "11px", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(224,120,48,0.28)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
          >
            {t.infoModalBtn}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "0.7rem 1rem",
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)",
              borderRadius: "11px", fontSize: "0.82rem",
              color: "var(--color-ink-muted)", cursor: "pointer", transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-edge-hi)"; e.currentTarget.style.color = "var(--color-ink)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-edge)"; e.currentTarget.style.color = "var(--color-ink-muted)"; }}
          >
            Devam Et
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
