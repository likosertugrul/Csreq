import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          borderRadius: 40,
          background: "linear-gradient(135deg, #1a1612 0%, #221c16 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 108,
          color: "#E07830",
        }}
      >
        ✦
      </div>
    ),
    { ...size }
  );
}
