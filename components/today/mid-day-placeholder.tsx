"use client";

export function MidDayPlaceholder() {
  return (
    <div style={{ padding: "40px 24px", maxWidth: "480px", margin: "0 auto" }}>
      <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "28px", color: "#3D2C20", marginBottom: "32px", marginTop: 0 }}>
        olen<span style={{ color: "#F0956A" }}>.</span>
      </p>
      <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "18px", color: "#3D2C20", lineHeight: 1.6, margin: 0 }}>
        You're working on it.
      </p>
    </div>
  );
}
