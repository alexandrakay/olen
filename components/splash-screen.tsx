"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export function SplashScreen() {
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
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF6EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "20rem" }}>
        {/* Logo */}
        <p
          style={{
            fontFamily: "var(--font-outfit)",
            fontWeight: 600,
            fontSize: "32px",
            color: "#3D2C20",
            marginBottom: "1.5rem",
          }}
        >
          olen<span style={{ color: "#F0956A" }}>.</span>
        </p>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "var(--font-lexend)",
            fontWeight: 300,
            fontSize: "18px",
            color: "#3D2C20",
            lineHeight: 1.6,
            marginBottom: "3rem",
          }}
        >
          The focus tool for people with too much going on.
        </p>

        {/* CTA */}
        <button
          onClick={handleSignIn}
          disabled={pending}
          style={{
            width: "100%",
            maxWidth: "20rem",
            boxSizing: "border-box",
            borderRadius: "8px",
            background: "#F0956A",
            padding: "14px 20px",
            color: "#FAF6EE",
            border: "none",
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1,
            fontFamily: "var(--font-lexend)",
            fontWeight: 400,
            fontSize: "16px",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!pending) e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = pending ? "0.7" : "1";
          }}
        >
          {pending ? "..." : "Continue with Google"}
        </button>

        {error && (
          <p
            style={{
              marginTop: "1rem",
              color: "rgba(61,44,32,0.5)",
              fontFamily: "var(--font-lexend)",
              fontWeight: 300,
              fontSize: "13px",
            }}
          >
            something went wrong. try again.
          </p>
        )}
      </div>
    </div>
  );
}
