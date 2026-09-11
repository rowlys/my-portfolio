import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0c0a",
          color: "#f5f7f2",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#22c55e",
            marginBottom: 28,
          }}
        >
          Portfolio
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            color: "#9ca39c",
            textAlign: "center",
          }}
        >
          {profile.tagline}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            width: 120,
            height: 4,
            background: "#22c55e",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
