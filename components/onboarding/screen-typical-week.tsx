"use client";

import { useState } from "react";
import { onboardingLayout, heading, subtext, nextButton, backButton, navRow, chip } from "./styles";
import type { SchedulePriors } from "@/lib/types";

interface Props {
  onAdvance: (priors: SchedulePriors) => Promise<void>;
  onBack: () => void;
  advancing: boolean;
}

type MorningWindow = SchedulePriors["morningWindow"];
type EnergyPeak = SchedulePriors["energyPeak"];

const MORNING_OPTIONS: { label: string; value: MorningWindow }[] = [
  { label: "Before 9am", value: "before-9am" },
  { label: "9–11am", value: "9-11am" },
  { label: "After 11am", value: "after-11am" },
  { label: "Varies", value: "varies" },
];

const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

const ENERGY_OPTIONS: { label: string; value: EnergyPeak }[] = [
  { label: "Morning", value: "morning" },
  { label: "Midday", value: "midday" },
  { label: "Evening", value: "evening" },
  { label: "Unpredictable", value: "unpredictable" },
];

export function ScreenTypicalWeek({ onAdvance, onBack, advancing }: Props) {
  const [morningWindow, setMorningWindow] = useState<MorningWindow | null>(null);
  const [chaoticDays, setChaoticDays] = useState<number[]>([]);
  const [energyPeak, setEnergyPeak] = useState<EnergyPeak | null>(null);

  const canAdvance = morningWindow !== null && energyPeak !== null && !advancing;

  function toggleDay(day: number) {
    setChaoticDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleAdvance() {
    if (!morningWindow || !energyPeak) return;
    onAdvance({ morningWindow, chaoticDays, energyPeak });
  }

  const questionLabel: React.CSSProperties = {
    fontFamily: "var(--font-outfit)",
    fontWeight: 500,
    fontSize: "16px",
    color: "#3D2C20",
    marginBottom: "10px",
    marginTop: 0,
  };

  return (
    <div style={onboardingLayout}>
      <p style={subtext}>Step 4 of 5</p>
      <h1 style={heading}>Tell olen about your typical week.</h1>
      <p style={{ ...subtext, marginBottom: "28px" }}>It uses this to make smarter picks from day one.</p>

      <div style={{ marginBottom: "24px" }}>
        <p style={questionLabel}>When do you usually start your day?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {MORNING_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => setMorningWindow(o.value)} style={chip(morningWindow === o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <p style={questionLabel}>Which days tend to go sideways?</p>
        <p style={{ ...subtext, marginBottom: "10px" }}>Optional. Leave blank if unpredictable.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {DAYS.map((d) => (
            <button key={d.value} onClick={() => toggleDay(d.value)} style={chip(chaoticDays.includes(d.value))}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <p style={questionLabel}>When's your energy usually best?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {ENERGY_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => setEnergyPeak(o.value)} style={chip(energyPeak === o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div style={navRow}>
        <button onClick={onBack} style={backButton}>Back</button>
        <button onClick={handleAdvance} disabled={!canAdvance} style={nextButton(canAdvance)}>
          {advancing ? "..." : "Next"}
        </button>
      </div>
    </div>
  );
}
