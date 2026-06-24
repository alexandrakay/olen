"use client";

import { motion } from "motion/react";

interface Props {
  /** Accent for the breathing dot + rings. Defaults to apricot. */
  accent?: string;
  /** Panel background. Defaults to a warm cream. */
  bg?: string;
  /** Secondary drifting-orb color. Defaults to yellow. */
  orb?: string;
  /** Small caption under the dot. */
  caption?: string;
  /** Text color for logo + caption. */
  text?: string;
}

/**
 * The ambient "living Dot" panel for the desktop web app — a calm, breathing
 * focal point that fills the empty half of a wide screen. On-brand: soft, slow,
 * never busy. Pure CSS/motion, no images.
 */
export function DotScene({
  accent = "#F0956A",
  bg = "#F4ECDC",
  orb = "#F4D080",
  caption = "one thing at a time",
  text = "#3D2C20",
}: Props) {
  const ring = (delay: number) => (
    <motion.div
      aria-hidden
      initial={{ scale: 0.5, opacity: 0.5 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: "easeOut" }}
      style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", border: `1.5px solid ${accent}` }}
    />
  );

  return (
    <div style={{ position: "relative", overflow: "hidden", background: bg, width: "100%", height: "100%" }}>
      <div style={{ position: "absolute", top: "34px", left: "38px", zIndex: 3, fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "22px", color: text }}>
        dot<span style={{ color: accent }}>.</span>
      </div>

      {/* drifting orbs */}
      <motion.div aria-hidden animate={{ x: [0, 26, 0], y: [0, -22, 0], scale: [1, 1.06, 1] }} transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-60px", left: "-40px", width: "240px", height: "240px", borderRadius: "50%", background: accent, filter: "blur(56px)", opacity: 0.3 }} />
      <motion.div aria-hidden animate={{ x: [0, -22, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: "-50px", right: "-30px", width: "220px", height: "220px", borderRadius: "50%", background: orb, filter: "blur(54px)", opacity: 0.28 }} />

      {/* floating context dots */}
      <motion.div aria-hidden animate={{ x: [0, 12, 0], y: [0, -20, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "30%", right: "18%", width: "14px", height: "14px", borderRadius: "50%", background: "#B8A4D8", opacity: 0.55 }} />
      <motion.div aria-hidden animate={{ x: [0, -14, 0], y: [0, -14, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: "30%", left: "20%", width: "10px", height: "10px", borderRadius: "50%", background: "#7BBFAA", opacity: 0.5 }} />
      <motion.div aria-hidden animate={{ x: [0, 9, 0], y: [0, 17, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "24%", left: "30%", width: "8px", height: "8px", borderRadius: "50%", background: accent, opacity: 0.5 }} />

      {/* centerpiece: breathing dot + pulsing rings */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ring(0)}
          {ring(1.3)}
          {ring(2.6)}
          <motion.div
            animate={{ scale: [1, 1.16, 1], opacity: [0.9, 0.55, 0.9] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "54px", height: "54px", borderRadius: "50%", background: accent, boxShadow: `0 10px 34px ${accent}55` }}
          />
        </div>
        <p style={{ marginTop: "42px", fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: text, opacity: 0.5 }}>
          {caption}
        </p>
      </div>
    </div>
  );
}
