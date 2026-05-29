import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          borderRadius: "18px",
          background: "linear-gradient(145deg, #0ea5e9 0%, #2563eb 60%, #0f172a 100%)",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: "-0.08em",
        }}
      >
        PL
      </div>
    ),
    size,
  );
}