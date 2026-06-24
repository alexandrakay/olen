"use client";

import { motion } from "motion/react";
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
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -28, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      style={{
        borderRadius: "12px",
        border: `1.5px solid ${color.band}`,
        background: color.bg,
        overflow: "hidden",
        marginBottom: "24px",
      }}
    >
      {/* Color band grows in */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.3, 0.8, 0.3, 1] }}
        style={{ height: "4px", background: color.band, transformOrigin: "left" }}
      />

      <div style={{ padding: "20px 20px 0" }}>
        <p style={{
          fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px",
          color: color.band, textTransform: "uppercase", letterSpacing: "0.12em",
          margin: "0 0 8px",
        }}>
          {candidate.context.label}
        </p>

        <p style={{
          fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "22px",
          color: color.text, margin: "0 0 12px", lineHeight: 1.25,
        }}>
          {title}
        </p>

        <p style={{
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px",
          color: color.text, opacity: 0.8, margin: "0 0 8px", lineHeight: 1.5,
        }}>
          {pickText}
        </p>

        {estMins ? (
          <p style={{
            fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "12px",
            color: color.text, opacity: 0.5, margin: "0 0 20px",
          }}>
            {EST_LABELS[estMins] ?? `${estMins} min`}
          </p>
        ) : (
          <div style={{ marginBottom: "20px" }} />
        )}
      </div>

      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <motion.button
          onClick={onAccept}
          whileTap={{ scale: 0.97 }}
          style={{
            borderRadius: "8px", background: "#F0956A", padding: "14px",
            color: "#FAF6EE", border: "none", cursor: "pointer",
            fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "16px",
            boxShadow: "0 8px 20px rgba(240,149,106,0.32)",
          }}
        >
          Let&apos;s do it
        </motion.button>
        <motion.button
          onClick={onReject}
          whileTap={{ scale: 0.97 }}
          style={{
            borderRadius: "8px", background: "transparent", padding: "12px",
            color: color.text, border: `1.5px solid ${color.band}`, cursor: "pointer",
            fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px",
            opacity: 0.75,
          }}
        >
          Not this one
        </motion.button>
      </div>
    </motion.div>
  );
}
