import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "radial-gradient(circle at top left, rgba(103, 232, 249, 0.28), transparent 28%), linear-gradient(135deg, #eff6ff 0%, #dbeafe 45%, #bfdbfe 100%)",
          color: "#0f172a",
          padding: "56px",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            borderRadius: "36px",
            background: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(148,163,184,0.3)",
            boxShadow: "0 30px 70px rgba(15,23,42,0.12)",
            padding: "48px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "700px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  display: "flex",
                  width: "88px",
                  height: "88px",
                  borderRadius: "24px",
                  background: "linear-gradient(145deg, #0ea5e9 0%, #2563eb 65%, #0f172a 100%)",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                PL
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "22px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#475569" }}>
                  Local-First Finance
                </div>
                <div style={{ fontSize: "56px", fontWeight: 800, letterSpacing: "-0.04em" }}>Pulse Ledger</div>
              </div>
            </div>

            <div style={{ fontSize: "34px", lineHeight: 1.25, color: "#1e293b" }}>
              Track wallets, budgets, and spending trends with a polished expense tracker that works offline and keeps your data on your device.
            </div>

            <div style={{ display: "flex", gap: "14px", marginTop: "10px" }}>
              {[
                "Offline-first",
                "Budget analytics",
                "Privacy-first",
              ].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    borderRadius: "999px",
                    background: "rgba(37,99,235,0.1)",
                    color: "#1d4ed8",
                    padding: "10px 18px",
                    fontSize: "22px",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "240px",
              height: "240px",
              borderRadius: "64px",
              background: "linear-gradient(155deg, #0ea5e9 0%, #2563eb 60%, #0f172a 100%)",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "90px",
              fontWeight: 900,
              letterSpacing: "-0.08em",
              boxShadow: "0 26px 56px rgba(37,99,235,0.22)",
            }}
          >
            PL
          </div>
        </div>
      </div>
    ),
    size,
  );
}