"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/auth-context";

const FADE_UP = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease: [0.2, 0.7, 0.2, 1] as const },
});

export function LandingScreen() {
  const { signInWithGoogle } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleSignIn() {
    setPending(true);
    setError(false);
    try {
      await signInWithGoogle();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <div style={{ background: "#FAF6EE", color: "#3D2C20", minHeight: "100vh" }}>
      {/* Nav */}
      <nav className="dot-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 0" }}>
        <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "26px" }}>
          dot<span style={{ color: "#F0956A" }}>.</span>
        </span>
        <button
          onClick={handleSignIn}
          disabled={pending}
          style={{ background: "#3D2C20", color: "#FAF6EE", padding: "9px 18px", borderRadius: "9px", border: "none", cursor: pending ? "default" : "pointer", fontFamily: "var(--font-lexend)", fontSize: "14px", fontWeight: 400 }}
        >
          {pending ? "..." : "Get Dot"}
        </button>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <motion.div aria-hidden animate={{ x: [0, 26, 0], y: [0, -22, 0], scale: [1, 1.06, 1] }} transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "-80px", right: "12%", width: "300px", height: "300px", borderRadius: "50%", background: "#F0956A", filter: "blur(54px)", opacity: 0.2, pointerEvents: "none" }} />
        <motion.div aria-hidden animate={{ x: [0, -22, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }} transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: "-60px", left: "-40px", width: "240px", height: "240px", borderRadius: "50%", background: "#F4D080", filter: "blur(50px)", opacity: 0.26, pointerEvents: "none" }} />

        <div className="dot-wrap dot-hero" style={{ position: "relative", padding: "64px 0 88px" }}>
          <div>
            <motion.p {...FADE_UP(0)} style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0956A", margin: "0 0 22px" }}>
              One thing at a time
            </motion.p>
            <motion.h1 {...FADE_UP(0.08)} style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "clamp(38px, 5vw, 58px)", lineHeight: 1.04, letterSpacing: "-1px", margin: "0 0 26px", textWrap: "balance" }}>
              The focus tool for people with too much going on.
            </motion.h1>
            <motion.p {...FADE_UP(0.16)} style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "18px", lineHeight: 1.65, color: "#6b5c4d", margin: "0 0 36px", maxWidth: "430px" }}>
              Every morning, Dot looks at everything on your plate and hands you one thing to start. No lists to drown in. No streaks. No guilt.
            </motion.p>
            <motion.div {...FADE_UP(0.24)} style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
              <motion.button onClick={handleSignIn} disabled={pending} whileTap={{ scale: 0.97 }}
                style={{ background: "#F0956A", color: "#FAF6EE", fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "16px", padding: "15px 28px", borderRadius: "11px", border: "none", cursor: "pointer", boxShadow: "0 8px 22px rgba(240,149,106,0.32)" }}>
                {pending ? "..." : "Start with one thing"}
              </motion.button>
              <a href="#how" style={{ fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "15px", color: "#6b5c4d", textDecoration: "none" }}>See how it works →</a>
            </motion.div>
            {error && (
              <p style={{ marginTop: "16px", color: "rgba(61,44,32,0.5)", fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "13px" }}>
                something went wrong. try again.
              </p>
            )}
          </div>

          {/* Phone mock */}
          <motion.div {...FADE_UP(0.3)} className="dot-mock" style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "268px", background: "#2A1F2E", borderRadius: "40px", padding: "9px", boxShadow: "0 30px 60px rgba(61,44,32,0.26)" }}>
              <div style={{ background: "#FAF6EE", borderRadius: "32px", overflow: "hidden", padding: "26px 20px 22px" }}>
                <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "18px", margin: "0 0 18px" }}>dot<span style={{ color: "#F0956A" }}>.</span></p>
                <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "13px", color: "#8a7b6c", margin: "0 0 14px" }}>Here&apos;s where I&apos;d start.</p>
                <div style={{ borderRadius: "14px", border: "1.5px solid #F0956A", background: "#FDE8D8", overflow: "hidden" }}>
                  <div style={{ height: "4px", background: "#F0956A" }} />
                  <div style={{ padding: "16px 16px 18px" }}>
                    <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#F0956A", margin: "0 0 8px" }}>Work</p>
                    <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "18px", lineHeight: 1.25, margin: "0 0 10px" }}>Draft the Q3 update</p>
                    <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "12px", lineHeight: 1.5, opacity: 0.75, margin: 0 }}>You said mornings are when you write best. This needs that.</p>
                  </div>
                  <div style={{ position: "relative", padding: "0 16px 16px" }}>
                    <motion.div aria-hidden animate={{ scale: [0.4, 2.2], opacity: [0.4, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut" }}
                      style={{ position: "absolute", left: "50%", top: "30%", width: "60px", height: "60px", marginLeft: "-30px", borderRadius: "50%", background: "#F0956A", pointerEvents: "none" }} />
                    <div style={{ position: "relative", background: "#F0956A", color: "#FAF6EE", textAlign: "center", fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "14px", padding: "12px", borderRadius: "9px" }}>Let&apos;s do it</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="dot-wrap" style={{ padding: "64px 0", borderTop: "1px solid #EDE4D4" }}>
        <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7BBFAA", margin: "0 0 34px" }}>How it works</p>
        <div className="dot-steps">
          {[
            { dot: "#F0956A", bg: "#FDE8D8", text: "#3D2C20", title: "Check in", body: "Fifteen seconds. How much time, how much energy. That's the whole ask." },
            { dot: "#7BBFAA", bg: "#D8EDE6", text: "#1E3D30", title: "Get one pick", body: "Dot weighs everything and hands you a single place to start. Not a top three. One." },
            { dot: "#B8A4D8", bg: "#E8DCEE", text: "#2E1E40", title: "Or don't", body: "Not feeling it? Pass. Tomorrow starts clean. Missed days are invisible here." },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              style={{ background: s.bg, borderRadius: "16px", padding: "30px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: s.dot, marginBottom: "22px" }} />
              <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "21px", color: s.text, margin: "0 0 10px" }}>{s.title}</p>
              <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px", lineHeight: 1.6, color: s.text, opacity: 0.75, margin: 0 }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Philosophy band */}
      <section style={{ background: "#2A1F2E", position: "relative", overflow: "hidden" }}>
        <motion.div aria-hidden animate={{ x: [0, 26, 0], y: [0, -22, 0], scale: [1, 1.06, 1] }} transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "-50px", right: "8%", width: "260px", height: "260px", borderRadius: "50%", background: "#B8A4D8", filter: "blur(54px)", opacity: 0.22 }} />
        <div className="dot-wrap" style={{ position: "relative", padding: "84px 0" }}>
          <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#B8A4D8", margin: "0 0 24px" }}>The thinking</p>
          <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "clamp(26px, 3.4vw, 38px)", lineHeight: 1.3, letterSpacing: "-0.5px", color: "#FAF6EE", margin: 0, maxWidth: "760px", textWrap: "balance" }}>
            Missed days are invisible. Low energy is data, not failure. Dot keeps the pressure off so the work can stay on.
          </motion.p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="dot-wrap" style={{ padding: "80px 0", textAlign: "center" }}>
        <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "clamp(30px, 4vw, 42px)", letterSpacing: "-0.5px", margin: "0 0 28px", textWrap: "balance" }}>
          Clear your head. Start with one thing.
        </motion.h2>
        <motion.button onClick={handleSignIn} disabled={pending} whileTap={{ scale: 0.97 }}
          style={{ background: "#F0956A", color: "#FAF6EE", fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "17px", padding: "16px 34px", borderRadius: "12px", border: "none", cursor: "pointer", boxShadow: "0 10px 26px rgba(240,149,106,0.32)" }}>
          {pending ? "..." : "Get Dot — it's free"}
        </motion.button>
        <p style={{ marginTop: "48px", fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "20px" }}>dot<span style={{ color: "#F0956A" }}>.</span></p>
      </section>

      <style jsx>{`
        .dot-wrap { max-width: 1120px; margin: 0 auto; padding-left: 32px; padding-right: 32px; }
        .dot-hero { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 48px; align-items: center; }
        .dot-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
        @media (max-width: 860px) {
          .dot-hero { grid-template-columns: 1fr; gap: 56px; }
          .dot-mock { order: -1; }
          .dot-steps { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
