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
    <div className="relative min-h-screen overflow-hidden bg-[#FAF6EE] flex items-center justify-center px-8">
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

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <p
          className="mb-12 text-[#3D2C20]"
          style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "32px" }}
        >
          olen<span className="text-[#F0956A]">.</span>
        </p>

        {/* Tagline */}
        <p
          className="mb-12 text-[#3D2C20] leading-relaxed"
          style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "22px" }}
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
              className="w-full rounded-[8px] border border-[#EDE4D4] bg-white/70 px-5 py-4 text-[#3D2C20] placeholder-[#EDE4D4] outline-none focus:border-[#F0956A] transition-colors"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "16px" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[8px] bg-[#F0956A] px-5 py-4 text-[#FAF6EE] transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "16px" }}
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
