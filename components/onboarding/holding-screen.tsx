"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  onNotificationResponse: (enabled: boolean) => Promise<void>;
}

export function HoldingScreen({ onNotificationResponse }: Props) {
  const [notifHandled, setNotifHandled] = useState(false);
  const [requesting, setRequesting] = useState(false);

  async function handleNotifications() {
    setRequesting(true);
    try {
      let enabled = false;
      if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        enabled = permission === "granted";
      }
      await onNotificationResponse(enabled);
      setNotifHandled(true);
    } finally {
      setRequesting(false);
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
        padding: "0 24px",
      }}
    >
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <p
          style={{
            fontFamily: "var(--font-outfit)",
            fontWeight: 600,
            fontSize: "32px",
            color: "#3D2C20",
            marginBottom: "24px",
          }}
        >
          olen<span style={{ color: "#F0956A" }}>.</span>
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
          You're all set. Olen will check in with you tomorrow morning.
        </p>

        {!notifHandled && (
          <button
            onClick={handleNotifications}
            disabled={requesting}
            style={{
              display: "block",
              width: "100%",
              borderRadius: "8px",
              background: "#F0956A",
              padding: "14px 20px",
              color: "#FAF6EE",
              border: "none",
              cursor: requesting ? "not-allowed" : "pointer",
              opacity: requesting ? 0.7 : 1,
              fontFamily: "var(--font-lexend)",
              fontWeight: 400,
              fontSize: "16px",
              marginBottom: "16px",
              transition: "opacity 0.15s",
            }}
          >
            Turn on notifications
          </button>
        )}

        <Link
          href="/inbox"
          style={{
            display: "block",
            fontFamily: "var(--font-lexend)",
            fontWeight: 300,
            fontSize: "15px",
            color: "#3D2C20",
            textDecoration: "none",
            opacity: 0.65,
          }}
        >
          See your task inbox →
        </Link>
      </div>
    </div>
  );
}
