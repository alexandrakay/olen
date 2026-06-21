"use client";

import { useState } from "react";
import { getContextColor } from "@/lib/context-colors";
import type { Task, Context } from "@/lib/types";

interface Props {
  tasks: Task[];
  contexts: Context[];
  onMoveToActive: (taskId: string) => void;
}

export function SomedaySection({ tasks, contexts, onMoveToActive }: Props) {
  const [expanded, setExpanded] = useState(false);

  function contextFor(task: Task): Context {
    return contexts.find((c) => c.id === task.contextId) ?? contexts[0];
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ borderTop: "1px solid #EDE4D4", marginBottom: "16px" }} />

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "none", border: "none", cursor: "pointer", padding: "0 0 12px",
          fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "12px",
          color: "rgba(61,44,32,0.5)", textTransform: "uppercase", letterSpacing: "0.1em",
          width: "100%",
        }}
      >
        <span>Someday</span>
        <span style={{
          background: "#EDE4D4", borderRadius: "10px", padding: "1px 7px",
          fontSize: "11px", fontWeight: 400,
        }}>
          {tasks.length}
        </span>
        <span style={{ marginLeft: "auto" }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tasks.map((task) => {
            const ctx = contextFor(task);
            const color = getContextColor(ctx.priority);
            return (
              <div
                key={task.id}
                style={{
                  display: "flex", alignItems: "stretch",
                  borderRadius: "8px", border: "1px solid #EDE4D4",
                  background: "#FAF6EE", overflow: "hidden",
                }}
              >
                <div style={{ width: "4px", flexShrink: 0, background: color.band }} />
                <div style={{ flex: 1, padding: "10px 12px" }}>
                  <p style={{
                    fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px",
                    color: color.band, textTransform: "uppercase", letterSpacing: "0.1em",
                    margin: "0 0 4px",
                  }}>
                    {ctx.label.toUpperCase()}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "15px",
                    color: "#3D2C20", margin: 0, lineHeight: 1.4,
                  }}>
                    {task.title}
                  </p>
                </div>
                <button
                  onClick={() => onMoveToActive(task.id)}
                  style={{
                    background: "none", border: "none", borderLeft: "1px solid #EDE4D4",
                    cursor: "pointer", padding: "0 14px",
                    fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "12px",
                    color: "rgba(61,44,32,0.5)", whiteSpace: "nowrap",
                  }}
                >
                  Move to active
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
