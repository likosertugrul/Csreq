"use client";

import { useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function SpotlightCard({ children, className = "", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const onMouseLeave = () => {
    ref.current?.style.setProperty("--mx", "-999px");
    ref.current?.style.setProperty("--my", "-999px");
  };

  return (
    <div
      ref={ref}
      className={`spotlight-card ${className}`}
      style={{ "--mx": "-999px", "--my": "-999px", ...style } as React.CSSProperties}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
