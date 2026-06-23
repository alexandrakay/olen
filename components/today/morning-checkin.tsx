"use client";

import { useState, useRef } from "react";

interface SubmitData {
  timeAvailableMins: 20 | 45 | 75 | 120;
  energyLevel: 1 | 2 | 3 | 4 | 5;
}

interface Props {
  onSubmit: (data: SubmitData) => void;
}

const TIME_OPTIONS: { label: string; value: 20 | 45 | 75 | 120 }[] = [
  { label: "15–30 min", value: 20 },
  { label: "30–60 min", value: 45 },
  { label: "1–2 hours", value: 75 },
  { label: "2+ hours", value: 120 },
];

const ENERGY_OPTIONS: { label: string; value: 1 | 2 | 3 | 4 | 5 }[] = [
  { label: "Running on fumes", value: 1 },
  { label: "Low", value: 2 },
  { label: "Steady", value: 3 },
  { label: "Good", value: 4 },
  { label: "Locked in", value: 5 },
];

export function MorningCheckin({ onSubmit }: Props) {
  const [time, setTime] = useState<20 | 45 | 75 | 120>(45);
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(3);

  const timeRef = useRef<20 | 45 | 75 | 120>(45);
  const energyRef = useRef<1 | 2 | 3 | 4 | 5>(3);
  const tapsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSubmit() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSubmit({ timeAvailableMins: timeRef.current, energyLevel: energyRef.current });
    }, 350);
  }

  function handleTap() {
    tapsRef.current += 1;
    if (tapsRef.current >= 2) scheduleSubmit();
  }

  function selectTime(value: 20 | 45 | 75 | 120) {
    timeRef.current = value;
    setTime(value);
    handleTap();
  }

  function selectEnergy(value: 1 | 2 | 3 | 4 | 5) {
    energyRef.current = value;
    setEnergy(value);
    handleTap();
  }

  const optionBtn = (selected: boolean): React.CSSProperties => ({
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: "8px",
    border: `1.5px solid ${selected ? "#F0956A" : "#EDE4D4"}`,
    background: selected ? "#FDE8D8" : "#FAF6EE",
    color: "#3D2C20",
    fontFamily: "var(--font-lexend)",
    fontWeight: selected ? 400 : 300,
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.1s",
  });

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Blur orbs */}
      <div style={{ position: "fixed", top: "-60px", right: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "#F0956A", filter: "blur(50px)", opacity: 0.22, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "80px", left: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "#F4D080", filter: "blur(45px)", opacity: 0.28, pointerEvents: "none" }} />

      <div style={{ padding: "40px 24px 100px", maxWidth: "480px", margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "28px", color: "#3D2C20", marginBottom: "32px", marginTop: 0 }}>
          dot<span style={{ color: "#F0956A" }}>.</span>
        </p>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px", color: "#F0956A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
            How much time do you have?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {TIME_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => selectTime(o.value)}
                data-selected={String(time === o.value)}
                style={optionBtn(time === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px", color: "#F0956A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
            How's your energy?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ENERGY_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => selectEnergy(o.value)}
                data-selected={String(energy === o.value)}
                style={optionBtn(energy === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
