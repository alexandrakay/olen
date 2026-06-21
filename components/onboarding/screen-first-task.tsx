"use client";

import { useState } from "react";
import { onboardingLayout, heading, subtext, nextButton, backButton, skipButton, navRow, chip } from "./styles";
import type { Context } from "@/lib/types";

interface NewTask {
  title: string;
  contextId: string;
}

interface Props {
  contexts: Context[];
  onAdvance: (task: NewTask) => Promise<void>;
  onSkip: () => Promise<void>;
  onBack: () => void;
  advancing: boolean;
}

export function ScreenFirstTask({ contexts, onAdvance, onSkip, onBack, advancing }: Props) {
  const [title, setTitle] = useState("");
  const [contextId, setContextId] = useState(contexts[0]?.id ?? "");

  const canAdvance = title.trim().length > 0 && contextId.length > 0 && !advancing;

  return (
    <div style={onboardingLayout}>
      <p style={subtext}>Step 5 of 5</p>
      <h1 style={heading}>What's one thing on your mind right now?</h1>
      <p style={{ ...subtext, marginBottom: "24px" }}>Something you've been meaning to move forward. Skip if nothing comes to mind.</p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: "8px",
          border: "1.5px solid #EDE4D4",
          background: "#FAF6EE",
          padding: "14px",
          fontFamily: "var(--font-lexend)",
          fontWeight: 300,
          fontSize: "15px",
          color: "#3D2C20",
          outline: "none",
          marginBottom: "16px",
        }}
      />

      {contexts.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <p style={{ ...subtext, marginBottom: "10px", opacity: 0.5 }}>Context</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {contexts.map((ctx) => (
              <button
                key={ctx.id}
                onClick={() => setContextId(ctx.id)}
                style={chip(contextId === ctx.id)}
              >
                {ctx.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={navRow}>
        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={onBack} style={backButton}>Back</button>
          <button onClick={() => onSkip()} style={skipButton}>Skip</button>
        </div>
        <button
          onClick={() => canAdvance && onAdvance({ title: title.trim(), contextId })}
          disabled={!canAdvance}
          style={nextButton(canAdvance)}
        >
          {advancing ? "..." : "Next"}
        </button>
      </div>
    </div>
  );
}
