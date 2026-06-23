"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/app/actions/create-checkout";

interface Props {
  completedDownloads: number;
  userEmail: string;
  uid: string;
}

export function PaywallScreen({ completedDownloads, userEmail, uid }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleCTA() {
    if (loading) return;
    setLoading(true);
    const { url } = await createCheckoutSession({ uid, email: userEmail });
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF6EE",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: "360px", width: "100%", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-outfit)",
            fontWeight: 600,
            fontSize: "28px",
            color: "#3D2C20",
            marginBottom: "8px",
          }}
        >
          dot<span style={{ color: "#F0956A" }}>.</span>
        </p>

        <p
          style={{
            fontFamily: "var(--font-lexend)",
            fontWeight: 300,
            fontSize: "18px",
            color: "#3D2C20",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          dot has logged {completedDownloads} day{completedDownloads !== 1 ? "s" : ""} with you. It&rsquo;s just getting started.
        </p>

        <button
          onClick={handleCTA}
          disabled={loading}
          aria-label="Continue with dot — $12/mo"
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            background: loading ? "#EDE4D4" : "#F0956A",
            fontFamily: "var(--font-outfit)",
            fontWeight: 600,
            fontSize: "17px",
            color: loading ? "rgba(61,44,32,0.4)" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "20px",
            transition: "background 150ms",
          }}
        >
          {loading ? "..." : "Continue with dot — $12/mo"}
        </button>

        <p
          style={{
            fontFamily: "var(--font-lexend)",
            fontWeight: 300,
            fontSize: "14px",
            color: "rgba(61,44,32,0.6)",
            lineHeight: 1.6,
            marginBottom: "24px",
          }}
        >
          Your tasks, contexts, and history are saved and waiting.
        </p>

        <p
          style={{
            fontFamily: "var(--font-lexend)",
            fontWeight: 300,
            fontSize: "13px",
            color: "rgba(61,44,32,0.4)",
          }}
        >
          Have a question?{" "}
          <a href="mailto:hello@olen.day" style={{ color: "#F0956A", textDecoration: "none" }}>
            hello@olen.day
          </a>
        </p>
      </div>
    </div>
  );
}
