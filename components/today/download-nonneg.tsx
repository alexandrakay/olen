"use client";

import type { Context } from "@/lib/types";

interface Props {
  nonNeg: Context;
  onAnswer: (contextId: string, value: boolean | null) => void;
}

export function DownloadNonNeg({ nonNeg, onAnswer }: Props) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <p style={{
        fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "18px",
        color: "#FAF6EE", margin: "0 0 16px", lineHeight: 1.3,
      }}>
        Did you protect {nonNeg.label} today?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { label: "Yes", value: true as boolean | null },
          { label: "No", value: false as boolean | null },
          { label: "Wasn't scheduled today", value: null as boolean | null },
        ].map((o) => (
          <button
            key={String(o.label)}
            onClick={() => onAnswer(nonNeg.id, o.value)}
            style={{
              borderRadius: "8px", padding: "12px 14px",
              fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px",
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
