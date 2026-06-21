import type { CSSProperties } from "react";

export const onboardingLayout: CSSProperties = {
  padding: "32px 24px",
  maxWidth: "480px",
  margin: "0 auto",
  width: "100%",
};

export const heading: CSSProperties = {
  fontFamily: "var(--font-outfit)",
  fontWeight: 500,
  fontSize: "22px",
  color: "#3D2C20",
  marginBottom: "8px",
  marginTop: 0,
};

export const subtext: CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 300,
  fontSize: "15px",
  color: "#3D2C20",
  opacity: 0.65,
  lineHeight: 1.6,
  margin: "0 0 8px",
};

export const navRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "24px",
};

export const backButton: CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 300,
  fontSize: "14px",
  color: "rgba(61,44,32,0.5)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

export const skipButton: CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 300,
  fontSize: "14px",
  color: "rgba(61,44,32,0.5)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

export function nextButton(enabled: boolean): CSSProperties {
  return {
    borderRadius: "8px",
    background: enabled ? "#F0956A" : "#EDE4D4",
    padding: "12px 28px",
    color: enabled ? "#FAF6EE" : "rgba(61,44,32,0.4)",
    border: "none",
    cursor: enabled ? "pointer" : "not-allowed",
    fontFamily: "var(--font-lexend)",
    fontWeight: 400,
    fontSize: "15px",
    transition: "all 0.15s",
  };
}

export const chip = (selected: boolean): CSSProperties => ({
  borderRadius: "4px",
  padding: "6px 12px",
  fontFamily: "var(--font-lexend)",
  fontWeight: 400,
  fontSize: "14px",
  border: `1.5px solid ${selected ? "#F0956A" : "#EDE4D4"}`,
  background: selected ? "#FDE8D8" : "#FAF6EE",
  color: "#3D2C20",
  cursor: "pointer",
});
