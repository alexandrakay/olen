"use client";

import { useEffect } from "react";

interface Props {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ message, onUndo, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
      zIndex: 300, background: "#3D2C20", borderRadius: "8px",
      padding: "12px 16px", display: "flex", alignItems: "center", gap: "16px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)", whiteSpace: "nowrap",
    }}>
      <span style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px", color: "#FAF6EE" }}>
        {message}
      </span>
      <button
        onClick={onUndo}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "14px",
          color: "#F0956A", padding: 0,
        }}
      >
        Undo
      </button>
    </div>
  );
}
