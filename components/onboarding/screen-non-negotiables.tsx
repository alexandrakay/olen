"use client";

import { useState } from "react";
import { onboardingLayout, heading, subtext, nextButton, backButton, skipButton, navRow, chip } from "./styles";
import type { Context } from "@/lib/types";

interface NonNegSelection {
  contextId: string;
  detail: string;
}

interface Props {
  contexts: Context[];
  onAdvance: (selections: NonNegSelection[]) => Promise<void>;
  onSkip: () => Promise<void>;
  onBack: () => void;
  advancing: boolean;
}

const MAX_NON_NEGS = 3;

export function ScreenNonNegotiables({ contexts, onAdvance, onSkip, onBack, advancing }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  function toggle(contextId: string) {
    if (selected[contextId] !== undefined) {
      const next = { ...selected };
      delete next[contextId];
      setSelected(next);
    } else if (Object.keys(selected).length < MAX_NON_NEGS) {
      setSelected({ ...selected, [contextId]: "" });
    }
  }

  function setDetail(contextId: string, detail: string) {
    setSelected({ ...selected, [contextId]: detail });
  }

  const selections: NonNegSelection[] = Object.entries(selected).map(([contextId, detail]) => ({ contextId, detail }));
  const canAdvance = selections.length > 0 && !advancing;

  return (
    <div style={onboardingLayout}>
      <p style={subtext}>Step 3 of 5</p>
      <h1 style={heading}>What are the things you refuse to let the day take from you?</h1>
      <p style={{ ...subtext, marginBottom: "24px" }}>Select up to 3. Skip if nothing comes to mind.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {contexts.map((ctx) => {
          const isSelected = selected[ctx.id] !== undefined;
          return (
            <div key={ctx.id}>
              <button
                onClick={() => toggle(ctx.id)}
                style={{
                  ...chip(isSelected),
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                }}
              >
                {ctx.label}
              </button>
              {isSelected && (
                <input
                  value={selected[ctx.id]}
                  onChange={(e) => setDetail(ctx.id, e.target.value)}
                  placeholder="Timing note (optional)"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    borderRadius: "0 0 8px 8px",
                    border: "1.5px solid #F0956A",
                    borderTop: "none",
                    background: "#FAF6EE",
                    padding: "10px 14px",
                    fontFamily: "var(--font-lexend)",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "#3D2C20",
                    outline: "none",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={navRow}>
        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={onBack} style={backButton}>Back</button>
          <button onClick={() => onSkip()} style={skipButton}>Skip</button>
        </div>
        <button
          onClick={() => canAdvance && onAdvance(selections)}
          disabled={!canAdvance}
          style={nextButton(canAdvance)}
        >
          {advancing ? "..." : "Next"}
        </button>
      </div>
    </div>
  );
}
