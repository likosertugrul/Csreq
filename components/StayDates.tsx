"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { T } from "@/lib/i18n";

type Props = {
  t: T;
  checkIn: string;
  checkOut: string;
  onCheckIn: (v: string) => void;
  onCheckOut: (v: string) => void;
};

function toISO(d: Date) { return d.toISOString().split("T")[0]; }

function formatShort(iso: string, monthsShort: readonly string[]) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthsShort[m - 1]} ${y}`;
}

function dayISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function StayDates({ t, checkIn, checkOut, onCheckIn, onCheckOut }: Props) {
  const today = toISO(new Date());
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [hover, setHover] = useState("");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current) return;
      const target = e.target as Node;
      // close if click is outside our root AND outside the portal calendar
      const portal = document.getElementById("stay-dates-portal");
      if (!ref.current.contains(target) && !(portal && portal.contains(target))) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;

  const openCalendar = (startPhase: "in" | "out") => {
    setPhase(startPhase);
    if (checkIn) {
      const [y, m] = checkIn.split("-").map(Number);
      setMonth({ y, m: m - 1 });
    }
    // calculate drop position from the root container
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen(true);
  };

  const prevMonth = () => setMonth(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
  const nextMonth = () => setMonth(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });

  const handleDay = (iso: string) => {
    if (iso < today) return;
    if (phase === "in") {
      onCheckIn(iso);
      if (checkOut && iso >= checkOut) onCheckOut("");
      setPhase("out");
    } else {
      if (iso <= checkIn) {
        onCheckIn(iso);
        onCheckOut("");
        setPhase("out");
      } else {
        onCheckOut(iso);
        setOpen(false);
        setPhase("in");
      }
    }
  };

  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const firstDOW = (new Date(month.y, month.m, 1).getDay() + 6) % 7;

  const rangeEnd = phase === "out" && hover && checkIn ? (hover > checkIn ? hover : checkIn) : checkOut;
  const rangeStart = checkIn;

  const renderDay = (day: number | null, idx: number) => {
    if (!day) return <div key={`e${idx}`} />;
    const iso = dayISO(month.y, month.m, day);
    const isPast = iso < today;
    const isIn = iso === checkIn;
    const isOut = iso === checkOut;
    const inRange = rangeStart && rangeEnd && iso > rangeStart && iso < rangeEnd;

    return (
      <button
        key={iso}
        onMouseEnter={() => phase === "out" && setHover(iso)}
        onMouseLeave={() => setHover("")}
        onClick={() => handleDay(iso)}
        disabled={isPast}
        style={{
          width: "100%", aspectRatio: "1", border: "none",
          borderRadius: isIn || isOut ? "8px" : "4px",
          background: isIn || isOut ? "var(--color-amber)" : inRange ? "rgba(224,120,48,0.15)" : "transparent",
          color: isIn || isOut ? "#fff" : isPast ? "rgba(255,255,255,0.15)" : "var(--color-ink)",
          fontSize: "0.78rem", fontWeight: isIn || isOut ? 700 : 400,
          cursor: isPast ? "default" : "pointer", transition: "background 0.15s",
        }}
        onMouseOver={e => { if (!isPast && !isIn && !isOut) e.currentTarget.style.background = "rgba(224,120,48,0.1)"; }}
        onMouseOut={e => {
          if (!isPast && !isIn && !isOut && !inRange) e.currentTarget.style.background = "transparent";
          if (!isPast && !isIn && !isOut && inRange) e.currentTarget.style.background = "rgba(224,120,48,0.15)";
        }}
      >
        {day}
      </button>
    );
  };

  const cells: (number | null)[] = [
    ...Array(firstDOW).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const calendar = open ? (
    <div
      id="stay-dates-portal"
      style={{
        position: "absolute",
        top: dropPos.top,
        left: dropPos.left,
        width: dropPos.width,
        zIndex: 9999,
        background: "var(--color-surface)",
        border: "1px solid var(--color-edge)",
        borderRadius: "14px",
        padding: "1.1rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ fontSize: "0.7rem", color: "var(--color-amber)", margin: "0 0 0.75rem", letterSpacing: "0.05em" }}>
        {phase === "in" ? t.selectCheckIn : t.selectCheckOut}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", color: "var(--color-ink-muted)", cursor: "pointer", padding: "4px 8px", fontSize: "1rem" }}>‹</button>
        <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--color-ink)" }}>
          {t.months[month.m]} {month.y}
        </span>
        <button onClick={nextMonth} style={{ background: "none", border: "none", color: "var(--color-ink-muted)", cursor: "pointer", padding: "4px 8px", fontSize: "1rem" }}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
        {t.days.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.65rem", color: "var(--color-ink-muted)", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((day, i) => renderDay(day, i))}
      </div>

      {(checkIn || checkOut) && (
        <button
          onClick={() => { onCheckIn(""); onCheckOut(""); setPhase("in"); setOpen(false); }}
          style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--color-ink-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          {t.clearBtn}
        </button>
      )}
    </div>
  ) : null;

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <label style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 500 }}>
        {t.stayDates}
      </label>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => openCalendar("in")}
          style={{
            flex: 1, padding: "9px 12px",
            background: "var(--color-surface)",
            border: `1px solid ${open && phase === "in" ? "var(--color-amber)" : "var(--color-edge)"}`,
            borderRadius: "10px",
            color: checkIn ? "var(--color-ink)" : "var(--color-ink-muted)",
            fontSize: "0.8rem", textAlign: "left", cursor: "pointer", transition: "border-color 0.2s",
          }}
        >
          <div style={{ fontSize: "0.6rem", color: "var(--color-ink-muted)", marginBottom: "2px", letterSpacing: "0.08em" }}>{t.checkInLabel}</div>
          {checkIn ? formatShort(checkIn, t.monthsShort) : t.selectDate}
        </button>

        <div style={{ display: "flex", alignItems: "center", color: "var(--color-ink-muted)", fontSize: "0.75rem" }}>→</div>

        <button
          onClick={() => openCalendar("out")}
          style={{
            flex: 1, padding: "9px 12px",
            background: "var(--color-surface)",
            border: `1px solid ${open && phase === "out" ? "var(--color-amber)" : "var(--color-edge)"}`,
            borderRadius: "10px",
            color: checkOut ? "var(--color-ink)" : "var(--color-ink-muted)",
            fontSize: "0.8rem", textAlign: "left", cursor: "pointer", transition: "border-color 0.2s",
          }}
        >
          <div style={{ fontSize: "0.6rem", color: "var(--color-ink-muted)", marginBottom: "2px", letterSpacing: "0.08em" }}>{t.checkOutLabel}</div>
          {checkOut ? formatShort(checkOut, t.monthsShort) : t.selectDate}
        </button>
      </div>

      {checkIn && checkOut && nights > 0 && (
        <p style={{ fontSize: "0.7rem", color: "var(--color-amber)", margin: 0 }}>
          {nights} {t.nights}
        </p>
      )}

      {typeof window !== "undefined" && createPortal(calendar, document.body)}
    </div>
  );
}
