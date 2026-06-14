"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { joinWaitlist } from "@/app/actions/waitlist";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    const result = await joinWaitlist(email);

    if (result.success) {
      // Best-effort auto-reply — never block or surface errors to the user
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          { to_email: email },
          { publicKey: EMAILJS_PUBLIC_KEY }
        );
      } catch {
        // intentionally silent
      }
      setStatus("success");
    } else {
      setStatus("error");
    }

    setLoading(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF6EE]">
      {/* Blur orbs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#F0956A]"
        style={{ filter: "blur(80px)", opacity: 0.22 }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-[#F4D080]"
        style={{ filter: "blur(80px)", opacity: 0.25 }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-[#F0956A]"
        style={{ filter: "blur(70px)", opacity: 0.15 }}
      />

      {/* Centering shell — inline padding/sizing bypasses Tailwind v4 flex quirks */}
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ padding: "0 2rem" }}
      >
        <div
          className="relative z-10"
          style={{ width: "100%", maxWidth: "28rem" }}
        >
          {/* Logo */}
          <p
            className="text-[#3D2C20]"
            style={{
              fontFamily: "var(--font-outfit)",
              fontWeight: 600,
              fontSize: "32px",
              marginBottom: "3rem",
            }}
          >
            olen<span className="text-[#F0956A]">.</span>
          </p>

          {/* Tagline */}
          <p
            className="text-[#3D2C20]"
            style={{
              fontFamily: "var(--font-lexend)",
              fontWeight: 300,
              fontSize: "22px",
              lineHeight: 1.6,
              marginBottom: "3rem",
            }}
          >
            not everything. just the next thing. olen.
          </p>

          {/* Email form */}
          {status === "success" ? (
            <p
              className="text-[#3D2C20]"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "16px" }}
            >
              you&apos;re on the list.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: "8px",
                  border: "1px solid #EDE4D4",
                  background: "rgba(255,255,255,0.7)",
                  padding: "16px 20px",
                  color: "#3D2C20",
                  outline: "none",
                  fontFamily: "var(--font-lexend)",
                  fontWeight: 300,
                  fontSize: "16px",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F0956A")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#EDE4D4")}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: "8px",
                  background: "#F0956A",
                  padding: "16px 20px",
                  color: "#FAF6EE",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  fontFamily: "var(--font-lexend)",
                  fontWeight: 400,
                  fontSize: "16px",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = loading ? "0.6" : "1";
                }}
              >
                {loading ? "..." : "get early access"}
              </button>
              {status === "error" && (
                <p
                  style={{
                    color: "rgba(61,44,32,0.5)",
                    fontFamily: "var(--font-lexend)",
                    fontWeight: 300,
                    fontSize: "12px",
                  }}
                >
                  something went wrong. try again.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
