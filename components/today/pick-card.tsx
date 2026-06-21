"use client";

import { getContextColor } from "@/lib/context-colors";
import type { ScoredCandidate } from "@/lib/types";

interface Props {
  candidate: ScoredCandidate;
  pickText: string;
  onAccept: () => void;
  onReject: () => void;
}

const EST_LABELS: Record<number, string> = {
  20: "20 min", 45: "45 min", 75: "1–2 hr", 120: "2 hr", 150: "2+ hr",
};

export function PickCard({ candidate, pickText, onAccept, onReject }: Props) {
  const color = getContextColor(candidate.context.priority);
  const isTask = candidate.type === "task";
  const title = isTask ? candidate.task!.title : candidate.context.label;
  const estMins = isTask ? candidate.task!.estimatedMins : null;

  return (
    <div style={{
      borderRadius: "12px",
      border: `1.5px solid ${color.band}`,
      background: color.bg,
      overflow: "hidden",
      marginBottom: "24px",
    }}>
      {/* Color band */}
      <div style={{ height: "4px", background: color.band }} />

      <div style={{ padding: "20px 20px 0" }}>
        {/* Context eyebrow */}
        <p style={{
          fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px",
          color: color.band, textTransform: "uppercase", letterSpacing: "0.1em",
          margin: "0 0 8px",
        }}>
          {candidate.context.label}
        </p>

        {/* Title */}
        <p style={{
          fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "22px",
          color: color.text, margin: "0 0 12px", lineHeight: 1.25,
        }}>
          {title}
        </p>

        {/* Claude pick text */}
        <p style={{
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px",
          color: color.text, opacity: 0.8, margin: "0 0 8px", lineHeight: 1.5,
        }}>
          {pickText}
        </p>

        {/* Estimated time */}
        {estMins && (
          <p style={{
            fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "12px",
            color: color.text, opacity: 0.5, margin: "0 0 20px",
          }}>
            {EST_LABELS[estMins] ?? `${estMins} min`}
          </p>
        )}
        {!estMins && <div style={{ marginBottom: "20px" }} />}
      </div>

      {/* Actions */}
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={onAccept}
          style={{
            borderRadius: "8px", background: "#F0956A", padding: "14px",
            color: "#FAF6EE", border: "none", cursor: "pointer",
            fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "16px",
          }}
        >
          Let&apos;s do it
        </button>
        <button
          onClick={onReject}
          style={{
            borderRadius: "8px", background: "transparent", padding: "12px",
            color: color.text, border: `1.5px solid ${color.band}`, cursor: "pointer",
            fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px",
            opacity: 0.7,
          }}
        >
          Not this one
        </button>
      </div>
    </div>
  );
}
