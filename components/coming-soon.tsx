"use client";

import { useState } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";

export function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    const result = await joinWaitlist(email);
    setLoading(false);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF6EE] flex items-center justify-center px-6">
      {/* Blur orbs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#F0956A]"
        style={{ filter: "blur(48px)", opacity: 0.25 }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#F4D080]"
        style={{ filter: "blur(48px)", opacity: 0.28 }}
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-16 h-64 w-64 rounded-full bg-[#F0956A]"
        style={{ filter: "blur(50px)", opacity: 0.2 }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <p
          className="mb-10 text-[#3D2C20]"
          style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "28px" }}
        >
          olen<span className="text-[#F0956A]">.</span>
        </p>

        {/* Tagline */}
        <p
          className="mb-10 text-[#3D2C20] leading-relaxed"
          style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "18px" }}
        >
          not everything. just the next thing. olen.
        </p>

        {/* Email form */}
        {status === "success" ? (
          <p
            className="text-[#3D2C20]"
            style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px" }}
          >
            you&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-[8px] border border-[#EDE4D4] bg-white/70 px-4 py-3 text-[#3D2C20] placeholder-[#EDE4D4] outline-none focus:border-[#F0956A] transition-colors"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[8px] bg-[#F0956A] px-4 py-3 text-[#FAF6EE] transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "15px" }}
            >
              {loading ? "..." : "get early access"}
            </button>
            {status === "error" && (
              <p
                className="text-[#3D2C20]/50"
                style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "12px" }}
              >
                something went wrong. try again.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
