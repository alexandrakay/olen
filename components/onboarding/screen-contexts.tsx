"use client";

import { useState } from "react";
import { onboardingLayout, heading, subtext, nextButton, backButton, navRow } from "./styles";

interface NewContext {
  label: string;
  description: string;
}

interface Props {
  onAdvance: (contexts: NewContext[]) => Promise<void>;
  onBack: () => void;
  advancing: boolean;
}

const MAX = 5;

export function ScreenContexts({ onAdvance, onBack, advancing }: Props) {
  const [contexts, setContexts] = useState<NewContext[]>([]);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  const canAdd = label.trim().length > 0 && contexts.length < MAX;
  const canAdvance = contexts.length >= 1 && !advancing;

  function add() {
    if (!canAdd) return;
    setContexts([...contexts, { label: label.trim(), description: description.trim() }]);
    setLabel("");
    setDescription("");
  }

  function remove(index: number) {
    setContexts(contexts.filter((_, i) => i !== index));
  }

  return (
    <div style={onboardingLayout}>
      <p style={subtext}>Step 2 of 5</p>
      <h1 style={heading}>What are the main areas of your life you're trying to move forward?</h1>
      <p style={{ ...subtext, marginBottom: "24px" }}>Add up to 5.</p>

      {contexts.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
          {contexts.map((ctx, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1.5px solid #EDE4D4",
                marginBottom: "8px",
              }}
            >
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "15px", color: "#3D2C20" }}>{ctx.label}</p>
                {ctx.description && (
                  <p style={{ margin: "2px 0 0", fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "13px", color: "rgba(61,44,32,0.6)" }}>{ctx.description}</p>
                )}
              </div>
              <button
                onClick={() => remove(i)}
                aria-label={`Remove ${ctx.label}`}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(61,44,32,0.4)", fontSize: "18px", lineHeight: 1 }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {contexts.length < MAX && (
        <div style={{ marginBottom: "8px" }}>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canAdd && add()}
            placeholder="Context name"
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: "8px",
              border: "1.5px solid #EDE4D4",
              background: "#FAF6EE",
              padding: "12px 14px",
              fontFamily: "var(--font-lexend)",
              fontWeight: 300,
              fontSize: "15px",
              color: "#3D2C20",
              outline: "none",
              marginBottom: "8px",
            }}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canAdd && add()}
            placeholder="What does progress look like here?"
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: "8px",
              border: "1.5px solid #EDE4D4",
              background: "#FAF6EE",
              padding: "12px 14px",
              fontFamily: "var(--font-lexend)",
              fontWeight: 300,
              fontSize: "14px",
              color: "#3D2C20",
              outline: "none",
              marginBottom: "8px",
            }}
          />
          <button
            onClick={add}
            disabled={!canAdd}
            style={{
              borderRadius: "8px",
              border: "1.5px solid #EDE4D4",
              background: "#FAF6EE",
              padding: "10px 20px",
              fontFamily: "var(--font-lexend)",
              fontWeight: 400,
              fontSize: "14px",
              color: canAdd ? "#3D2C20" : "rgba(61,44,32,0.4)",
              cursor: canAdd ? "pointer" : "not-allowed",
            }}
          >
            Add
          </button>
        </div>
      )}

      <div style={navRow}>
        <button onClick={onBack} style={backButton}>Back</button>
        <button
          onClick={() => canAdvance && onAdvance(contexts)}
          disabled={!canAdvance}
          style={nextButton(canAdvance)}
        >
          {advancing ? "..." : "Next"}
        </button>
      </div>
    </div>
  );
}
