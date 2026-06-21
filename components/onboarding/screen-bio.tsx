"use client";

import { useState } from "react";
import { onboardingLayout, heading, subtext, nextButton, backButton, navRow } from "./styles";

interface Props {
  initialValue?: string;
  onAdvance: (bio: string) => Promise<void>;
  onBack: () => void;
  advancing: boolean;
}

export function ScreenBio({ initialValue = "", onAdvance, onBack, advancing }: Props) {
  const [bio, setBio] = useState(initialValue);
  const canAdvance = bio.trim().length > 0 && !advancing;

  return (
    <div style={onboardingLayout}>
      <p style={subtext}>Step 1 of 5</p>
      <h1 style={heading}>Describe your life in a few sentences.</h1>
      <p style={{ ...subtext, marginBottom: "24px" }}>What are you juggling right now?</p>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="I'm a parent of two, running a business while..."
        rows={5}
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
          lineHeight: 1.7,
          resize: "vertical",
          outline: "none",
        }}
      />
      <div style={navRow}>
        <button onClick={onBack} style={backButton}>Back</button>
        <button
          onClick={() => canAdvance && onAdvance(bio.trim())}
          disabled={!canAdvance}
          style={nextButton(canAdvance)}
        >
          {advancing ? "..." : "Next"}
        </button>
      </div>
    </div>
  );
}
