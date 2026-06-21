"use client";

export function MorningUnavailable() {
  return (
    <div style={{ padding: "40px 24px", maxWidth: "480px", margin: "0 auto" }}>
      <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "28px", color: "#FAF6EE", marginBottom: "32px", marginTop: 0 }}>
        olen<span style={{ color: "#B8A4D8" }}>.</span>
      </p>
      <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "18px", color: "#FAF6EE", lineHeight: 1.6, margin: 0, opacity: 0.7 }}>
        Check-in opens at 5am.
      </p>
    </div>
  );
}
