"use client";

const ENERGY_OPTIONS: { label: string; value: 1 | 2 | 3 | 4 | 5 }[] = [
  { label: "Depleted", value: 1 },
  { label: "Low", value: 2 },
  { label: "Okay", value: 3 },
  { label: "Good", value: 4 },
  { label: "Solid", value: 5 },
];

interface Props {
  onAnswer: (value: 1 | 2 | 3 | 4 | 5) => void;
}

export function DownloadQ2({ onAnswer }: Props) {
  return (
    <div>
      <p style={{
        fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "20px",
        color: "#FAF6EE", margin: "0 0 24px", lineHeight: 1.3,
      }}>
        How did your energy hold up today?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {ENERGY_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onAnswer(o.value)}
            style={{
              borderRadius: "8px", padding: "14px",
              fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "16px",
              cursor: "pointer", border: "1.5px solid rgba(250,246,238,0.2)",
              background: "transparent", color: "#FAF6EE", textAlign: "left" as const,
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
