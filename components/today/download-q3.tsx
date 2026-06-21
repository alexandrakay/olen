"use client";

import { useState } from "react";
import type { DerailerType } from "@/lib/types";

interface Answer {
  derailerType: DerailerType;
  derailerNote: string | null;
}

interface Props {
  onAnswer: (answer: Answer) => void;
}

const OPTIONS: { label: string; value: DerailerType }[] = [
  { label: "Life got loud", value: "external" },
  { label: "I ran out of steam", value: "energy" },
  { label: "Honestly not sure", value: "unclear" },
];

export function DownloadQ3({ onAnswer }: Props) {
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div>
      <p style={{
        fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "20px",
        color: "#FAF6EE", margin: "0 0 24px", lineHeight: 1.3,
      }}>
        What got in the way?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onAnswer({ derailerType: o.value, derailerNote: note.trim() || null })}
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

      {!noteExpanded ? (
        <button
          onClick={() => setNoteExpanded(true)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "4px 0",
            fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "13px",
            color: "rgba(250,246,238,0.4)",
          }}
        >
          Add a note
        </button>
      ) : (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 280))}
          placeholder="Anything else on your mind..."
          rows={3}
          style={{
            display: "block", width: "100%", boxSizing: "border-box",
            borderRadius: "8px", border: "1.5px solid rgba(250,246,238,0.2)",
            background: "transparent", color: "#FAF6EE", padding: "12px",
            fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px",
            resize: "none", outline: "none",
          }}
        />
      )}
    </div>
  );
}
