"use client";

import { useState } from "react";
import { canAddNonNeg, NON_NEG_CAP_MESSAGE } from "@/lib/context-management";

interface SubmitPayload {
  label: string;
  description: string;
  isNonNegotiable: boolean;
  nonNegotiableDetail: string | null;
}

interface Props {
  nonNegCount: number;
  onSubmit: (payload: SubmitPayload) => void;
  onCancel: () => void;
}

export function ContextForm({ nonNegCount, onSubmit, onCancel }: Props) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isNonNeg, setIsNonNeg] = useState(false);
  const nonNegBlocked = !canAddNonNeg(nonNegCount);
  const canSubmit = label.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      label: label.trim(),
      description: description.trim(),
      isNonNegotiable: isNonNeg,
      nonNegotiableDetail: null,
    });
  }

  return (
    <div
      style={{
        borderRadius: "8px",
        border: "1.5px solid #F0956A",
        padding: "14px",
        background: "#FAF6EE",
        marginBottom: "12px",
      }}
    >
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
        placeholder="Context name"
        style={inputStyle}
        autoFocus
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What does progress look like here?"
        style={{ ...inputStyle, fontSize: "14px", marginBottom: "10px" }}
      />

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: nonNegBlocked ? "not-allowed" : "pointer",
          opacity: nonNegBlocked ? 0.5 : 1,
          marginBottom: "10px",
        }}
      >
        <input
          type="checkbox"
          role="checkbox"
          aria-label="Non-negotiable"
          checked={isNonNeg}
          disabled={nonNegBlocked}
          onChange={() => setIsNonNeg(!isNonNeg)}
        />
        <span style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px", color: "#3D2C20" }}>
          Non-negotiable
        </span>
      </label>

      {nonNegBlocked && (
        <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "13px", color: "rgba(61,44,32,0.6)", margin: "0 0 10px" }}>
          {NON_NEG_CAP_MESSAGE}
        </p>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onCancel}
          style={{
            borderRadius: "8px",
            border: "1.5px solid #EDE4D4",
            background: "transparent",
            padding: "10px 18px",
            fontFamily: "var(--font-lexend)",
            fontWeight: 400,
            fontSize: "14px",
            color: "rgba(61,44,32,0.6)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            borderRadius: "8px",
            border: "none",
            background: canSubmit ? "#F0956A" : "#EDE4D4",
            padding: "10px 18px",
            fontFamily: "var(--font-lexend)",
            fontWeight: 400,
            fontSize: "14px",
            color: canSubmit ? "#fff" : "rgba(61,44,32,0.4)",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          Add
        </button>
      </div>
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
  marginBottom: "8px",
};
