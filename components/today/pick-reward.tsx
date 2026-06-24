"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  /** Context band color of the accepted pick (e.g. "#F0956A"). */
  bandColor: string;
  /** Surface color the checkmark is cut out of (e.g. the card bg). */
  cardBg: string;
  /** Title of the accepted task/context, shown under the confirmation. */
  title: string;
  /** Set false to honor reduced-motion / the "no celebration" preference. */
  celebrate?: boolean;
  onSubmit: (mins: 20 | 45 | 75 | 120) => void;
  onSkip: () => void;
}

const TIME_PRESETS: { label: string; value: 20 | 45 | 75 | 120 }[] = [
  { label: "20 min", value: 20 },
  { label: "45 min", value: 45 },
  { label: "1–2 hr", value: 75 },
  { label: "2 hr+", value: 120 },
];

function makeParticles(color: string) {
  return Array.from({ length: 16 }, () => ({
    left: 20 + Math.random() * 60,
    dx: (Math.random() - 0.5) * 150,
    dy: -50 - Math.random() * 150,
    size: 4 + Math.random() * 5,
    delay: Math.random() * 0.16,
    dur: 0.95 + Math.random() * 0.6,
    color: Math.random() > 0.75 ? "#F4D080" : color,
  }));
}

export function PickReward({ bandColor, cardBg, title, celebrate = true, onSubmit, onSkip }: Props) {
  const [showEstimate, setShowEstimate] = useState(false);
  const particles = useMemo(() => (celebrate ? makeParticles(bandColor) : []), [bandColor, celebrate]);

  useEffect(() => {
    const t = setTimeout(() => setShowEstimate(true), 880);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ padding: "36px 0 24px", textAlign: "center", position: "relative" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: "30px" }}>
        {/* Bloom ring */}
        {celebrate && (
          <motion.div
            aria-hidden
            initial={{ scale: 0.35, opacity: 0.45 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{ position: "absolute", top: "50%", left: "50%", width: "96px", height: "96px", marginLeft: "-48px", marginTop: "-48px", borderRadius: "50%", background: bandColor, pointerEvents: "none" }}
          />
        )}

        {/* Check medallion */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 16 }}
          style={{ position: "relative", width: "84px", height: "84px", borderRadius: "50%", background: bandColor, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 30px ${bandColor}55` }}
        >
          <motion.span
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "block", width: "26px", height: "14px", borderLeft: `3px solid ${cardBg}`, borderBottom: `3px solid ${cardBg}`, transform: "rotate(-45deg) translate(1px,-2px)" }}
          />
        </motion.div>

        {/* Confetti */}
        {celebrate && (
          <div style={{ position: "absolute", left: 0, right: 0, top: "42px", height: 0, pointerEvents: "none" }}>
            {particles.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 0.4 }}
                transition={{ duration: p.dur, delay: p.delay, ease: [0.2, 0.6, 0.3, 1] }}
                style={{ position: "absolute", left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", background: p.color }}
              />
            ))}
          </div>
        )}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "26px", color: "#3D2C20", margin: "0 0 8px" }}
      >
        That&apos;s the one.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px", color: "rgba(61,44,32,0.6)", margin: "0 0 36px" }}
      >
        {title}
      </motion.p>

      <AnimatePresence>
        {showEstimate && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ textAlign: "left" }}
          >
            <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "15px", color: "#3D2C20", margin: "0 0 14px" }}>
              How long do you think this&apos;ll take?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", marginBottom: "16px" }}>
              {TIME_PRESETS.map((p) => (
                <motion.button
                  key={p.value}
                  onClick={() => onSubmit(p.value)}
                  whileTap={{ scale: 0.95 }}
                  style={{ borderRadius: "8px", padding: "9px 16px", fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "14px", border: "1.5px solid #EDE4D4", background: "transparent", color: "#3D2C20", cursor: "pointer" }}
                >
                  {p.label}
                </motion.button>
              ))}
            </div>
            <button
              onClick={onSkip}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "13px", color: "rgba(61,44,32,0.4)" }}
            >
              Skip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
