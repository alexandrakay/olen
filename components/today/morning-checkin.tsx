"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SubmitData {
  timeAvailableMins: 20 | 45 | 75 | 120;
  energyLevel: 1 | 2 | 3 | 4 | 5;
}

interface Props {
  onSubmit: (data: SubmitData) => void;
  /** Evening mode: dark plum surface, lavender highlights, purple CTA. */
  isEvening?: boolean;
}

const TIME_OPTIONS: { label: string; value: 20 | 45 | 75 | 120 }[] = [
  { label: "15–30 min", value: 20 },
  { label: "30–60 min", value: 45 },
  { label: "1–2 hours", value: 75 },
  { label: "2+ hours", value: 120 },
];

const ENERGY_OPTIONS: { label: string; value: 1 | 2 | 3 | 4 | 5; height: number }[] = [
  { label: "Running on fumes", value: 1, height: 26 },
  { label: "Low", value: 2, height: 38 },
  { label: "Steady", value: 3, height: 50 },
  { label: "Good", value: 4, height: 62 },
  { label: "Locked in", value: 5, height: 76 },
];

const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;

function theme(isEvening: boolean) {
  if (isEvening) {
    return {
      bg: "#2A1F2E",
      text: "#FAF6EE",
      subText: "rgba(250,246,238,0.62)",
      accent: "#B8A4D8",
      accentShadow: "rgba(184,164,216,0.34)",
      pillSelBg: "rgba(184,164,216,0.16)",
      hairline: "rgba(250,246,238,0.22)",
      energyUnfilled: "rgba(250,246,238,0.06)",
      ctaBg: "#B8A4D8",
      ctaText: "#2A1F2E",
      orbA: "#B8A4D8",
      orbAOpacity: 0.24,
      orbB: "#F0956A",
      orbBOpacity: 0.14,
      greeting: "Good evening.",
    };
  }
  return {
    bg: "#FAF6EE",
    text: "#3D2C20",
    subText: "rgba(61,44,32,0.62)",
    accent: "#F0956A",
    accentShadow: "rgba(240,149,106,0.32)",
    pillSelBg: "#FDE8D8",
    hairline: "#EDE4D4",
    energyUnfilled: "#FDF4DC",
    ctaBg: "#F0956A",
    ctaText: "#FAF6EE",
    orbA: "#F0956A",
    orbAOpacity: 0.22,
    orbB: "#F4D080",
    orbBOpacity: 0.28,
    greeting: "Good morning.",
  };
}

export function MorningCheckin({ onSubmit, isEvening = false }: Props) {
  const t = theme(isEvening);
  const [time, setTime] = useState<20 | 45 | 75 | 120 | null>(null);
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const canStart = time !== null && energy !== null;
  const energyLabel =
    energy === null ? "Tap to set your energy" : ENERGY_OPTIONS.find((o) => o.value === energy)!.label;

  function handleStart() {
    if (time === null || energy === null) return;
    onSubmit({ timeAvailableMins: time, energyLevel: energy });
  }

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "100vh", background: t.bg }}>
      {/* Drifting blur orbs */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 26, 0], y: [0, -22, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "fixed", top: "-60px", right: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: t.orbA, filter: "blur(50px)", opacity: t.orbAOpacity, pointerEvents: "none" }}
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -22, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "fixed", bottom: "80px", left: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: t.orbB, filter: "blur(45px)", opacity: t.orbBOpacity, pointerEvents: "none" }}
      />

      <div style={{ padding: "40px 24px 120px", maxWidth: "480px", margin: "0 auto", position: "relative" }}>
        <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "24px", color: t.text, margin: "0 0 26px" }}>
          dot<span style={{ color: t.accent }}>.</span>
        </p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}>
          <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "28px", letterSpacing: "-0.3px", color: t.text, margin: "0 0 6px" }}>
            {t.greeting}
          </p>
          <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px", color: t.subText, margin: "0 0 34px" }}>
            Let&apos;s figure out today.
          </p>
        </motion.div>

        {/* Time */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.06, ease: [0.2, 0.7, 0.2, 1] }} style={{ marginBottom: "34px" }}>
          <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px", color: t.accent, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 14px" }}>
            How much time do you have?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {TIME_OPTIONS.map((o) => {
              const selected = time === o.value;
              return (
                <motion.button
                  key={o.value}
                  onClick={() => setTime(o.value)}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 15px", borderRadius: "11px",
                    border: `1.5px solid ${selected ? t.accent : t.hairline}`,
                    background: selected ? t.pillSelBg : "transparent",
                    color: t.text, fontFamily: "var(--font-lexend)",
                    fontWeight: selected ? 400 : 300, fontSize: "15px", cursor: "pointer",
                  }}
                >
                  <span>{o.label}</span>
                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 600, damping: 18 }}
                        style={{ width: "7px", height: "7px", borderRadius: "50%", background: t.accent }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Energy */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0.7, 0.2, 1] }}>
          <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px", color: t.accent, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
            How&apos;s your energy?
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "9px", height: "78px", marginBottom: "14px" }}>
            {ENERGY_OPTIONS.map((o) => {
              const filled = energy !== null && o.value <= energy;
              const selected = energy === o.value;
              return (
                <motion.button
                  key={o.value}
                  onClick={() => setEnergy(o.value)}
                  whileTap={{ scaleY: 0.94 }}
                  animate={{ y: selected ? -3 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                  style={{
                    flex: 1, height: `${o.height}px`, borderRadius: "8px", padding: 0, cursor: "pointer",
                    border: `1.5px solid ${selected ? "#E8B84A" : filled ? "transparent" : t.hairline}`,
                    background: filled ? "#F4D080" : t.energyUnfilled,
                    transition: "background 0.3s, border-color 0.3s",
                  }}
                />
              );
            })}
          </div>
          <motion.p
            key={energyLabel}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "15px", color: t.text, minHeight: "22px", margin: 0 }}
          >
            {energyLabel}
          </motion.p>
        </motion.div>
      </div>

      {/* CTA */}
      <AnimatePresence>
        {canStart && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ position: "fixed", left: 0, right: 0, bottom: "26px", padding: "0 24px", maxWidth: "480px", margin: "0 auto" }}
          >
            <motion.button
              onClick={handleStart}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%", background: t.ctaBg, color: t.ctaText, border: "none",
                borderRadius: "13px", padding: "17px", fontFamily: "var(--font-lexend)",
                fontWeight: 500, fontSize: "16px", cursor: "pointer",
                boxShadow: `0 10px 24px ${t.accentShadow}`,
              }}
            >
              See today&apos;s pick →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
