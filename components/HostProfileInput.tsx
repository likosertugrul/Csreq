"use client";

import { useState, useEffect, useRef } from "react";
import type { T } from "@/lib/i18n";

type Warning = { type: "restriction" | "info"; message: string };

type Props = {
  t: T;
  value: string;
  onChange: (text: string) => void;
  homeValue: string;
  onHomeChange: (text: string) => void;
  refsValue: string;
  onRefsChange: (text: string) => void;
  userGender?: string;
};

type Sections = { profile: boolean; home: boolean; references: boolean };

function isValidCsUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.includes("couchsurfing.com");
  } catch { return false; }
}

export default function HostProfileInput({ t, value, onChange, homeValue, onHomeChange, refsValue, onRefsChange, userGender }: Props) {
  const [profileUrl, setProfileUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [sections, setSections] = useState<Sections | null>(null);
  const [showExtra, setShowExtra] = useState(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const analyze = async (text: string, home?: string, refs?: string) => {
    if (text.trim().length < 80) { setWarnings([]); return; }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileText: text, homeText: home, refsText: refs, userGender }),
      });
      const data = await res.json();
      setWarnings(data.warnings ?? []);
    } catch {
      setWarnings([]);
    } finally {
      setAnalyzing(false);
    }
  };

  // Debounce analysis on manual text change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyze(value, homeValue, refsValue), 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, homeValue, refsValue]);

  const handleFetch = async () => {
    if (!isValidCsUrl(profileUrl)) return;
    setFetching(true);
    setFetchError("");
    setSections(null);
    setWarnings([]);
    try {
      const res = await fetch("/api/fetch-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: profileUrl }),
      });
      const data = await res.json();
      if (data.success) {
        onChange(data.text);
        setSections(data.sections);
        if (!data.sections.home || !data.sections.references) setShowExtra(true);
        // Analyze immediately after fetch
        analyze(data.text, homeValue, refsValue);
      } else {
        setFetchError(t.fetchError);
      }
    } catch {
      setFetchError(t.fetchConnError);
    } finally {
      setFetching(false);
    }
  };

  const handleClear = () => {
    onChange(""); onHomeChange(""); onRefsChange("");
    setProfileUrl(""); setSections(null); setFetchError(""); setShowExtra(false);
    setWarnings([]);
  };

  const sectionLabels = { profile: t.sectionProfile, home: t.sectionHome, references: t.sectionRefs };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <label style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 500 }}>
        {t.hostProfile}
      </label>

      {!value && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="url"
              className="input"
              placeholder={t.phProfile}
              value={profileUrl}
              onChange={e => { setProfileUrl(e.target.value); setFetchError(""); setSections(null); }}
              onKeyDown={e => { if (e.key === "Enter") handleFetch(); }}
              style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem" }}
            />
            <button
              onClick={handleFetch}
              disabled={!isValidCsUrl(profileUrl) || fetching}
              style={{
                padding: "8px 16px",
                background: isValidCsUrl(profileUrl) && !fetching ? "var(--color-amber)" : "rgba(255,255,255,0.06)",
                color: isValidCsUrl(profileUrl) && !fetching ? "#fff" : "var(--color-ink-muted)",
                border: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600,
                cursor: isValidCsUrl(profileUrl) && !fetching ? "pointer" : "not-allowed",
                whiteSpace: "nowrap", transition: "background 0.2s",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              {fetching ? (
                <>
                  <span style={{ width: "10px", height: "10px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", flexShrink: 0 }} />
                  {t.fetching}
                </>
              ) : t.fetchBtn}
            </button>
          </div>
          {fetchError && <p style={{ fontSize: "0.72rem", color: "#e07070", margin: 0 }}>{fetchError}</p>}
        </div>
      )}

      {sections && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {(["profile", "home", "references"] as const).map(k => (
            <span key={k} style={{
              fontSize: "0.65rem", padding: "2px 8px", borderRadius: "20px",
              background: sections[k] ? "rgba(224,120,48,0.12)" : "rgba(255,255,255,0.04)",
              color: sections[k] ? "var(--color-amber)" : "var(--color-ink-muted)",
              border: `1px solid ${sections[k] ? "rgba(224,120,48,0.3)" : "var(--color-edge)"}`,
            }}>
              {sections[k] ? "✓" : "–"} {sectionLabels[k]}
            </span>
          ))}
        </div>
      )}

      <textarea
        className="input"
        style={{ resize: "none", minHeight: "180px", lineHeight: 1.7, fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
        placeholder={t.phProfileText}
        value={value}
        onChange={e => onChange(e.target.value)}
      />

      {/* Warnings */}
      {(warnings.length > 0 || analyzing) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {analyzing && warnings.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", border: "1.5px solid rgba(255,255,255,0.2)", borderTopColor: "var(--color-amber)", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "0.7rem", color: "var(--color-ink-muted)" }}>Profil analiz ediliyor...</span>
            </div>
          )}
          {warnings.map((w, i) => (
            <div key={i} style={{
              display: "flex", gap: "8px", alignItems: "flex-start",
              padding: "8px 12px", borderRadius: "8px",
              background: w.type === "restriction" ? "rgba(220,60,60,0.08)" : "rgba(224,120,48,0.08)",
              border: `1px solid ${w.type === "restriction" ? "rgba(220,60,60,0.25)" : "rgba(224,120,48,0.2)"}`,
            }}>
              <span style={{ fontSize: "0.8rem", flexShrink: 0, marginTop: "1px" }}>
                {w.type === "restriction" ? "⚠" : "ℹ"}
              </span>
              <span style={{
                fontSize: "0.75rem", lineHeight: 1.5,
                color: w.type === "restriction" ? "#e07070" : "var(--color-amber)",
              }}>
                {w.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {value && (
        <button
          onClick={() => setShowExtra(v => !v)}
          style={{
            alignSelf: "flex-start", fontSize: "0.7rem", padding: "4px 10px",
            border: "1px solid var(--color-edge)", borderRadius: "6px",
            color: "var(--color-ink-muted)", background: "none", cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          {showExtra ? "▾" : "▸"} {t.homeAndRefs} {showExtra ? "" : t.optional}
        </button>
      )}

      {showExtra && value && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <ExtraField label={t.homeSection} placeholder={t.phHome} value={homeValue} onChange={onHomeChange} />
          <ExtraField label={t.refsSection} placeholder={t.phRefs} value={refsValue} onChange={onRefsChange} />
        </div>
      )}

      {value && (
        <button
          onClick={handleClear}
          style={{ alignSelf: "flex-start", fontSize: "0.7rem", color: "var(--color-ink-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          {t.clearBtn}
        </button>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ExtraField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.68rem", color: "var(--color-ink-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</label>
      <textarea
        className="input"
        style={{ resize: "none", minHeight: "90px", lineHeight: 1.7, fontSize: "0.75rem" }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
