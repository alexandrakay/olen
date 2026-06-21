"use client";

const TIME_PRESETS: { label: string; value: 20 | 45 | 75 | 120 }[] = [
  { label: "20 min", value: 20 },
  { label: "45 min", value: 45 },
  { label: "1–2 hr", value: 75 },
  { label: "2 hr+", value: 120 },
];

interface Props {
  onSubmit: (mins: 20 | 45 | 75 | 120) => void;
  onSkip: () => void;
}

export function PostAcceptance({ onSubmit, onSkip }: Props) {
  return (
    <div style={{ padding: "0 0 24px" }}>
      <p style={{
        fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "15px",
        color: "#3D2C20", margin: "0 0 16px",
      }}>
        How long do you think this&apos;ll take?
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {TIME_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onSubmit(p.value)}
            style={{
              borderRadius: "4px", padding: "8px 16px",
              fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "14px",
              border: "1.5px solid #EDE4D4", background: "#FAF6EE",
              color: "#3D2C20", cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        onClick={onSkip}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: "4px 0",
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "13px",
          color: "rgba(61,44,32,0.4)",
        }}
      >
        Skip
      </button>
    </div>
  );
}
