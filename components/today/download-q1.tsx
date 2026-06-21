"use client";

import type { Checkin } from "@/lib/types";
import type { DownloadPrefill } from "@/lib/download-prefill";
import type { CompletedFocusTask } from "@/lib/types";

interface Props {
  checkin: Checkin;
  pickedLabel: string | null;
  onAnswer: (value: CompletedFocusTask) => void;
  prefill?: DownloadPrefill | null;
}

function getQuestion(checkin: Checkin, pickedLabel: string | null): string {
  if (!checkin.userAccepted || (!checkin.pickedTaskId && !checkin.pickedContextId)) {
    return "Did you work on anything today?";
  }
  if (checkin.pickedContextId && !checkin.pickedTaskId) {
    return `Did you spend any time on ${pickedLabel}?`;
  }
  return `Did you get to ${pickedLabel}?`;
}

const OPTIONS: { label: string; value: CompletedFocusTask }[] = [
  { label: "Yes", value: "yes" },
  { label: "Partial", value: "partial" },
  { label: "No", value: "no" },
];

export function DownloadQ1({ checkin, pickedLabel, onAnswer, prefill }: Props) {
  const question = getQuestion(checkin, pickedLabel);

  return (
    <div>
      <p style={{
        fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "20px",
        color: "#FAF6EE", margin: "0 0 24px", lineHeight: 1.3,
      }}>
        {question}
      </p>

      {prefill && (
        <p style={{
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "13px",
          color: "#EDE4D4", margin: "-16px 0 20px", opacity: 0.7,
        }}>
          {prefill.subtext}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {OPTIONS.map((o) => {
          const isPrefilled = prefill?.preselect === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onAnswer(o.value)}
              style={{
                borderRadius: "8px", padding: "14px",
                fontFamily: "var(--font-lexend)", fontWeight: isPrefilled ? 400 : 300,
                fontSize: "16px", cursor: "pointer",
                border: isPrefilled ? "1.5px solid #B8A4D8" : "1.5px solid rgba(250,246,238,0.2)",
                background: isPrefilled ? "rgba(184,164,216,0.15)" : "transparent",
                color: "#FAF6EE",
                textAlign: "left" as const,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
