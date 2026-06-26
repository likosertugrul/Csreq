"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { UserProfile } from "@/lib/prompts";
import type { T } from "@/lib/i18n";

type Props = {
  t: T;
  onSave: (profile: UserProfile) => void;
  onClose?: () => void;
  onDeleteAccount?: () => void;
  initial?: UserProfile | null;
  userId?: string;
};

const EMPTY: UserProfile = { name: "", hometown: "", purpose: "", interests: "", notes: "", homeText: "", gender: undefined };

function isValidCsUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.includes("couchsurfing.com");
  } catch { return false; }
}

export default function UserProfileSetup({ t, onSave, onClose, onDeleteAccount, initial, userId }: Props) {
  const [form, setForm] = useState<UserProfile>(initial ?? EMPTY);
  const [csUrl, setCsUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = () => {
    if (!onClose) return;
    setIsClosing(true);
    setTimeout(onClose, 220);
  };

  const set = (k: keyof UserProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImport = async () => {
    if (!isValidCsUrl(csUrl)) return;
    setImporting(true);
    setImportError("");
    try {
      const fetchRes = await fetch("/api/fetch-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: csUrl }),
      });
      const fetchData = await fetchRes.json();
      if (!fetchData.success) { setImportError(t.importError); return; }

      const parseRes = await fetch("/api/parse-user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fetchData.text }),
      });
      const parseData = await parseRes.json();
      if (!parseData.success) { setImportError(t.parseError); return; }

      setForm(f => ({
        name: parseData.profile.name || f.name,
        hometown: parseData.profile.hometown || f.hometown,
        purpose: parseData.profile.purpose || f.purpose,
        interests: parseData.profile.interests || f.interests,
        notes: parseData.profile.notes || f.notes,
      }));
    } catch {
      setImportError(t.connError);
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (userId) {
      await fetch("/api/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    onSave(form);
  };

  const modal = (
    <div
      className={isClosing ? "animate-backdrop-out" : "animate-backdrop-in"}
      style={{
        position: "fixed", inset: 0, zIndex: 9990,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        background: "rgba(8,8,8,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md ${isClosing ? "animate-modal-out" : "animate-modal-in"}`}
        style={{
          position: "relative",
          background: "var(--color-surface)",
          border: "1px solid var(--color-edge-hi)",
          borderRadius: "20px",
          padding: "2rem",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        {onClose && (
          <button
            type="button"
            onClick={handleClose}
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

        <div style={{ marginBottom: "1.75rem" }}>
          <p style={{ color: "var(--color-amber)", fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.6rem", fontWeight: 500 }}>
            {t.setupBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 400, color: "var(--color-ink)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            {t.setupTitle}
          </h2>
          <p style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            {t.setupSubtitle}
          </p>
        </div>

        {/* CS URL import */}
        <div style={{
          background: "var(--color-amber-dim)",
          border: "1px solid rgba(224,120,48,0.2)",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}>
          <p style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", margin: 0 }}>{t.importFromCS}</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="url"
              className="input"
              placeholder="couchsurfing.com/c/users/..."
              value={csUrl}
              onChange={e => { setCsUrl(e.target.value); setImportError(""); }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleImport(); } }}
              style={{ flex: 1, padding: "8px 12px", fontSize: "0.78rem" }}
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={!isValidCsUrl(csUrl) || importing}
              style={{
                padding: "8px 14px",
                background: isValidCsUrl(csUrl) && !importing ? "var(--color-amber)" : "rgba(255,255,255,0.06)",
                color: isValidCsUrl(csUrl) && !importing ? "#fff" : "var(--color-ink-muted)",
                border: "none", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 600,
                cursor: isValidCsUrl(csUrl) && !importing ? "pointer" : "not-allowed",
                whiteSpace: "nowrap", transition: "background 0.2s",
                display: "flex", alignItems: "center", gap: "5px",
              }}
            >
              {importing ? (
                <>
                  <span style={{ width: "10px", height: "10px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  {t.fetching}
                </>
              ) : t.fillBtn}
            </button>
          </div>
          {importError && <p style={{ fontSize: "0.72rem", color: "#e07070", margin: 0 }}>{importError}</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <Field label={t.fieldName} required>
            <input className="input" placeholder={t.phName} value={form.name} onChange={set("name")} required />
          </Field>
          <Field label={t.fieldHometown}>
            <input className="input" placeholder={t.phHometown} value={form.hometown} onChange={set("hometown")} />
          </Field>
          <Field label={t.fieldPurpose}>
            <input className="input" placeholder={t.phPurpose} value={form.purpose} onChange={set("purpose")} />
          </Field>
          <Field label={t.fieldInterests}>
            <input className="input" placeholder={t.phInterests} value={form.interests} onChange={set("interests")} />
          </Field>
          <Field label={t.fieldGender}>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["male", "female", "other"] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, gender: f.gender === g ? undefined : g }))}
                  style={{
                    flex: 1, padding: "7px 4px", fontSize: "0.75rem", borderRadius: "8px",
                    border: `1px solid ${form.gender === g ? "rgba(224,120,48,0.5)" : "var(--color-edge)"}`,
                    background: form.gender === g ? "var(--color-amber-dim)" : "transparent",
                    color: form.gender === g ? "var(--color-amber)" : "var(--color-ink-muted)",
                    cursor: "pointer", transition: "all 0.15s", fontWeight: form.gender === g ? 600 : 400,
                  }}
                >
                  {g === "male" ? t.genderMale : g === "female" ? t.genderFemale : t.genderOther}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t.fieldNotes}>
            <textarea className="input" style={{ resize: "none" }} rows={2} placeholder={t.phNotes} value={form.notes} onChange={set("notes")} />
          </Field>
          <Field label={`${t.fieldHomeText} ${t.optional}`}>
            <textarea className="input" style={{ resize: "none" }} rows={2} placeholder={t.phHomeText} value={form.homeText ?? ""} onChange={set("homeText")} />
          </Field>
          <Field label={`${t.fieldRefsText} ${t.optional}`}>
            <textarea className="input" style={{ resize: "none" }} rows={2} placeholder={t.phRefsText} value={form.refsText ?? ""} onChange={set("refsText")} />
          </Field>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "1.75rem", width: "100%",
            background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
            color: "#fff", fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.02em",
            padding: "0.8rem", borderRadius: "12px", border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(224,120,48,0.3)", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(224,120,48,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(224,120,48,0.3)"; }}
        >
          {t.saveBtn}
        </button>

        {onDeleteAccount && !confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            style={{
              marginTop: "0.75rem", width: "100%", padding: "0.65rem",
              background: "transparent", border: "1px solid rgba(220,60,60,0.18)",
              borderRadius: "12px", fontSize: "0.78rem", color: "rgba(220,80,80,0.6)",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(220,60,60,0.4)"; e.currentTarget.style.color = "#e07070"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(220,60,60,0.18)"; e.currentTarget.style.color = "rgba(220,80,80,0.6)"; }}
          >
            {t.deleteAccount}
          </button>
        )}

        {confirmDelete && (
          <div style={{
            marginTop: "0.75rem", padding: "1rem",
            background: "rgba(220,60,60,0.06)", border: "1px solid rgba(220,60,60,0.2)",
            borderRadius: "12px",
          }}>
            <p style={{ fontSize: "0.78rem", color: "#e07070", marginBottom: "0.75rem", lineHeight: 1.5 }}>
              {t.deleteAccountConfirm}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                style={{
                  flex: 1, padding: "0.55rem",
                  background: "rgba(255,255,255,0.06)", border: "1px solid var(--color-edge)",
                  borderRadius: "10px", fontSize: "0.78rem", color: "var(--color-ink-muted)",
                  cursor: "pointer",
                }}
              >
                {t.deleteCancel}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  await fetch("/api/auth/delete-account", { method: "DELETE" });
                  onDeleteAccount?.();
                }}
                style={{
                  flex: 1, padding: "0.55rem",
                  background: "rgba(220,60,60,0.15)", border: "1px solid rgba(220,60,60,0.35)",
                  borderRadius: "10px", fontSize: "0.78rem", color: "#e07070",
                  cursor: deleting ? "not-allowed" : "pointer", fontWeight: 600,
                }}
              >
                {deleting ? "..." : t.deleteAccountBtn}
              </button>
            </div>
          </div>
        )}
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.7rem", color: "var(--color-ink-muted)", marginBottom: "0.35rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "var(--color-amber)", marginLeft: "2px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
