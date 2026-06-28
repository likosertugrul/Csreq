import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "csreq — CouchSurfing Couch Request Writer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#181614",
          display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "80px",
          fontFamily: "serif",
        }}
      >
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(224,120,48,0.12) 0%, transparent 50%)",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "40px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "10px",
            background: "linear-gradient(135deg, #E07830, #F08A45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", color: "#fff",
          }}>✦</div>
          <span style={{ fontSize: "28px", fontWeight: 500, color: "#F0EBE4", letterSpacing: "-0.01em" }}>csreq</span>
        </div>

        <div style={{ fontSize: "64px", fontWeight: 300, color: "#F0EBE4", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: "24px" }}>
          Write better<br />
          <span style={{ color: "rgba(240,235,228,0.45)", fontStyle: "italic" }}>CouchSurfing requests.</span>
        </div>

        <div style={{ fontSize: "22px", color: "rgba(240,235,228,0.55)", lineHeight: 1.6, maxWidth: "680px", marginBottom: "48px" }}>
          Paste the host's profile. Pick your dates. Get a genuine, personalized letter in seconds — no AI clichés.
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          {["25 languages", "No AI fingerprint", "5 letters free"].map(tag => (
            <div key={tag} style={{
              padding: "8px 18px",
              border: "1px solid rgba(224,120,48,0.35)",
              borderRadius: "100px",
              background: "rgba(224,120,48,0.1)",
              color: "#E07830",
              fontSize: "16px", fontWeight: 500,
            }}>{tag}</div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
