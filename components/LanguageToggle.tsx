"use client";

import type { T, Lang } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/prompts";

type Props = {
  t: T;
  appLang: Lang;
  value: string;
  onChange: (v: string) => void;
};

export default function LanguageToggle({ t, appLang, value, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <label style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 500 }}>
        {t.letterLang}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: "100%",
            appearance: "none", WebkitAppearance: "none",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--color-edge)",
            borderRadius: "10px",
            padding: "8px 36px 8px 12px",
            fontSize: "0.82rem",
            color: "var(--color-ink)",
            cursor: "pointer",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--color-amber)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--color-edge)"; }}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code} style={{ background: "#1a1a1a" }}>
              {appLang === "TR" ? lang.nameTR : lang.nameEN}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <span style={{
          position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
          pointerEvents: "none", color: "var(--color-ink-muted)", fontSize: "0.65rem",
        }}>
          ▾
        </span>
      </div>
    </div>
  );
}
