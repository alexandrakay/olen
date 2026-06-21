"use client";

import { useState } from "react";
import type { Context } from "@/lib/types";

type Mode = "choose" | "move" | "complete-confirm";

interface Props {
  context: Context;
  incompleteTaskCount: number;
  otherContexts: Context[];
  onMoveAll: (targetContextId: string) => void;
  onCompleteAll: () => void;
  onClose: () => void;
}

export function ArchiveSheet({ context, incompleteTaskCount, otherContexts, onMoveAll, onCompleteAll, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("choose");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  if (mode === "move") {
    return (
      <div style={sheetStyle}>
        <p style={titleStyle}>Move {incompleteTaskCount} incomplete task{incompleteTaskCount !== 1 ? "s" : ""} to:</p>
        <div style={{ marginBottom: "16px" }}>
          {otherContexts.map((ctx) => (
            <button
              key={ctx.id}
              onClick={() => setSelectedTarget(ctx.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: "8px",
                border: `1.5px solid ${selectedTarget === ctx.id ? "#F0956A" : "#EDE4D4"}`,
                background: selectedTarget === ctx.id ? "#FDE8D8" : "#FAF6EE",
                fontFamily: "var(--font-lexend)",
                fontWeight: 300,
                fontSize: "15px",
                color: "#3D2C20",
                cursor: "pointer",
                marginBottom: "8px",
              }}
            >
              {ctx.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setMode("choose")} style={cancelBtn}>Back</button>
          <button
            onClick={() => selectedTarget && onMoveAll(selectedTarget)}
            disabled={!selectedTarget}
            aria-label="Confirm move"
            style={primaryBtn(!selectedTarget)}
          >
            Confirm move
          </button>
        </div>
      </div>
    );
  }

  if (mode === "complete-confirm") {
    return (
      <div style={sheetStyle}>
        <p style={titleStyle}>Mark all {incompleteTaskCount} tasks as done?</p>
        <p style={bodyStyle}>This can't be undone.</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setMode("choose")} style={cancelBtn}>Back</button>
          <button onClick={onCompleteAll} aria-label="Confirm" style={primaryBtn(false)}>Confirm</button>
        </div>
      </div>
    );
  }

  return (
    <div style={sheetStyle}>
      <p style={titleStyle}>"{context.label}" has {incompleteTaskCount} incomplete task{incompleteTaskCount !== 1 ? "s" : ""}.</p>
      <p style={bodyStyle}>Before archiving, choose what to do with them.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => setMode("move")}
          aria-label="Move all"
          style={optionBtn}
        >
          Move all tasks to another context
        </button>
        <button
          onClick={() => setMode("complete-confirm")}
          aria-label="Mark all done"
          style={optionBtn}
        >
          Mark all tasks as done
        </button>
      </div>
      <button onClick={onClose} aria-label="Cancel" style={cancelBtn}>Cancel</button>
    </div>
  );
}

const sheetStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "#FAF6EE",
  borderRadius: "16px 16px 0 0",
  padding: "24px 24px calc(24px + env(safe-area-inset-bottom))",
  boxShadow: "0 -4px 24px rgba(61,44,32,0.12)",
  zIndex: 100,
  maxWidth: "480px",
  margin: "0 auto",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-outfit)",
  fontWeight: 600,
  fontSize: "17px",
  color: "#3D2C20",
  margin: "0 0 8px",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-lexend)",
  fontWeight: 300,
  fontSize: "14px",
  color: "rgba(61,44,32,0.6)",
  margin: "0 0 16px",
};

const optionBtn: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "8px",
  border: "1.5px solid #EDE4D4",
  background: "#FAF6EE",
  fontFamily: "var(--font-lexend)",
  fontWeight: 400,
  fontSize: "15px",
  color: "#3D2C20",
  cursor: "pointer",
  textAlign: "left",
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  borderRadius: "8px",
  border: "1.5px solid #EDE4D4",
  background: "transparent",
  fontFamily: "var(--font-lexend)",
  fontWeight: 400,
  fontSize: "14px",
  color: "rgba(61,44,32,0.6)",
  cursor: "pointer",
};

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    flex: 2,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: disabled ? "#EDE4D4" : "#F0956A",
    fontFamily: "var(--font-lexend)",
    fontWeight: 400,
    fontSize: "14px",
    color: disabled ? "rgba(61,44,32,0.4)" : "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
