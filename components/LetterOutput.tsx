"use client";

import { useState, useEffect, useRef } from "react";
import type { T } from "@/lib/i18n";

type Props = { t: T; letter: string; charLimit?: number };

export default function LetterOutput({ t, letter, charLimit = 980 }: Props) {
  const [text, setText] = useState(letter);
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => { setText(letter); }, [letter]);
  useEffect(() => { autoResize(); }, [text]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const overLimit = text.length > charLimit;

  return (
    <div className="animate-letter" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-amber)" }} />
          <span style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 500 }}>
            {t.letterLabel}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontSize: "0.72rem", letterSpacing: "0.02em",
            color: overLimit ? "#e05050" : "var(--color-ink-muted)",
            transition: "color 0.2s",
          }}>
            {text.length} / {charLimit}
          </span>
          <button
            onClick={copy}
            style={{
              fontSize: "0.75rem", padding: "6px 16px",
              border: `1px solid ${copied ? "rgba(224,120,48,0.4)" : "var(--color-edge)"}`,
              borderRadius: "100px",
              background: copied ? "var(--color-amber-dim)" : "transparent",
              color: copied ? "var(--color-amber)" : "var(--color-ink-muted)",
              cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.02em",
            }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.borderColor = "rgba(224,120,48,0.4)"; e.currentTarget.style.color = "var(--color-amber)"; e.currentTarget.style.background = "var(--color-amber-dim)"; } }}
            onMouseLeave={e => { if (!copied) { e.currentTarget.style.borderColor = "var(--color-edge)"; e.currentTarget.style.color = "var(--color-ink-muted)"; e.currentTarget.style.background = "transparent"; } }}
          >
            {copied ? t.copiedBtn : t.copyBtn}
          </button>
        </div>
      </div>

      <div style={{
        background: "var(--color-paper)",
        borderRadius: "16px",
        padding: "2.5rem 3rem",
        boxShadow: `0 0 0 1px ${overLimit ? "rgba(224,80,80,0.35)" : "var(--color-edge-hi)"}, 0 8px 40px rgba(0,0,0,0.25)`,
        position: "relative",
        overflow: "hidden",
        transition: "background 0.3s, box-shadow 0.2s",
      }}>
        {/* Ruled lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, var(--color-paper-line) 27px, var(--color-paper-line) 28px)",
          backgroundPosition: "0 2.5rem",
          pointerEvents: "none",
        }} />
        {/* Left margin rule */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: "2.5rem",
          width: "1px", background: "var(--color-paper-line)",
          opacity: 0.6, pointerEvents: "none",
        }} />
        <textarea
          ref={taRef}
          value={text}
          onChange={e => { setText(e.target.value); autoResize(); }}
          rows={1}
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.875rem", lineHeight: 1.9,
            color: "var(--color-paper-ink)", whiteSpace: "pre-wrap", position: "relative",
            paddingLeft: "1.5rem",
            width: "100%", height: "auto", overflow: "hidden",
            background: "transparent", border: "none", outline: "none", resize: "none",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
