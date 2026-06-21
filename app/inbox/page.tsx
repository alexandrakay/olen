"use client";

import { NavBar } from "@/components/nav-bar";

export default function InboxPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAF6EE" }}>
      <div style={{ padding: "40px 24px 100px", maxWidth: "480px", margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "28px", color: "#3D2C20", marginTop: 0, marginBottom: "32px" }}>
          olen<span style={{ color: "#F0956A" }}>.</span>
        </p>
        <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "18px", color: "#3D2C20", opacity: 0.5, lineHeight: 1.6, margin: 0 }}>
          Inbox coming in issue #6.
        </p>
      </div>
      <NavBar />
    </div>
  );
}
