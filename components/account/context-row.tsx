"use client";

import { useState } from "react";
import type { Context } from "@/lib/types";
import { canAddNonNeg, NON_NEG_CAP_MESSAGE } from "@/lib/context-management";

interface UpdatePayload {
  label?: string;
  previousLabel?: string | null;
  description?: string;
  isNonNegotiable?: boolean;
  nonNegotiableDetail?: string | null;
}

interface Props {
  context: Context;
  nonNegCount: number;
  onArchive: (id: string) => void;
  onUpdate: (payload: UpdatePayload) => void;
}

export function ContextRow({ context, nonNegCount, onArchive, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState(context.label);
  const [description, setDescription] = useState(context.description);
  const nonNegBlocked = !context.isNonNegotiable && !canAddNonNeg(nonNegCount);

  function handleLabelBlur() {
    const trimmed = label.trim();
    if (trimmed && trimmed !== context.label) {
      onUpdate({ label: trimmed, previousLabel: context.label });
    }
  }

  function handleDescBlur() {
    const trimmed = description.trim();
    if (trimmed !== context.description) {
      onUpdate({ description: trimmed });
    }
  }

  function handleNonNegToggle() {
    if (nonNegBlocked) return;
    onUpdate({ isNonNegotiable: !context.isNonNegotiable });
  }

  return (
    <div
      style={{
        borderRadius: "8px",
        border: "1.5px solid #EDE4D4",
        marginBottom: "8px",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", background: "#FAF6EE" }}>
        <button
          aria-label={`expand ${context.label}`}
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            flex: 1,
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontWeight: 500,
              fontSize: "15px",
              color: "#3D2C20",
              flex: 1,
            }}
          >
            {context.label}
          </span>
          {context.isNonNegotiable && (
            <span style={{ fontSize: "11px", color: "#F0956A", fontFamily: "var(--font-lexend)", fontWeight: 400 }}>
              non-neg
            </span>
          )}
          <span
            style={{
              color: "rgba(61,44,32,0.4)",
              fontSize: "12px",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 150ms",
              display: "inline-block",
            }}
          >
            ›
          </span>
        </button>
        <button
          aria-label={`archive ${context.label}`}
          onClick={() => onArchive(context.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(61,44,32,0.35)",
            fontSize: "13px",
            fontFamily: "var(--font-lexend)",
            fontWeight: 400,
            padding: "0 0 0 12px",
          }}
        >
          Archive
        </button>
      </div>

      {expanded && (
        <div style={{ padding: "0 14px 14px", background: "#FAF6EE", borderTop: "1px solid #EDE4D4" }}>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelBlur}
            style={inputStyle}
            aria-label="Context label"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="What does progress look like here?"
            style={{ ...inputStyle, fontSize: "14px" }}
            aria-label="Context description"
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: nonNegBlocked ? "not-allowed" : "pointer",
              opacity: nonNegBlocked ? 0.5 : 1,
            }}
          >
            <input
              type="checkbox"
              role="checkbox"
              aria-label="Non-negotiable"
              checked={context.isNonNegotiable}
              disabled={nonNegBlocked}
              onChange={handleNonNegToggle}
            />
            <span
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 300,
                fontSize: "14px",
                color: "#3D2C20",
              }}
            >
              Non-negotiable
            </span>
          </label>

          {nonNegBlocked && (
            <p
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 300,
                fontSize: "13px",
                color: "rgba(61,44,32,0.6)",
                margin: "6px 0 0",
              }}
            >
              {NON_NEG_CAP_MESSAGE}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "8px",
  border: "1.5px solid #EDE4D4",
  background: "#FAF6EE",
  padding: "10px 12px",
  fontFamily: "var(--font-lexend)",
  fontWeight: 300,
  fontSize: "15px",
  color: "#3D2C20",
  outline: "none",
  marginTop: "10px",
  marginBottom: "8px",
};
