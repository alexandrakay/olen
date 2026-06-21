"use client";

import { useState, useRef } from "react";
import { getContextColor } from "@/lib/context-colors";
import type { Context } from "@/lib/types";

interface NewTask {
  title: string;
  contextId: string;
  dueDate: "today" | "tomorrow" | "this-week" | null;
}

interface Props {
  contexts: Context[];
  lastUsedContextId?: string;
  onAdd: (task: NewTask) => void;
}

const DUE_PRESETS = [
  { label: "Today", value: "today" as const },
  { label: "Tomorrow", value: "tomorrow" as const },
  { label: "This week", value: "this-week" as const },
];

export function AddTaskForm({ contexts, lastUsedContextId, onAdd }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [contextId, setContextId] = useState(lastUsedContextId ?? contexts[0]?.id ?? "");
  const [due, setDue] = useState<NewTask["dueDate"]>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleExpand() {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSubmit() {
    if (!title.trim()) { reset(); return; }
    onAdd({ title: title.trim(), contextId, dueDate: due });
    reset();
  }

  function reset() {
    setTitle("");
    setDue(null);
    setExpanded(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") reset();
  }

  function handleBlur() {
    if (!title.trim()) reset();
  }

  return (
    <div style={{
      borderRadius: "8px",
      border: "1.5px solid #EDE4D4",
      background: "#FAF6EE",
      marginBottom: "16px",
      overflow: "hidden",
    }}>
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={handleExpand}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Add a task..."
        style={{
          display: "block",
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 16px",
          fontFamily: "var(--font-lexend)",
          fontWeight: 300,
          fontSize: "15px",
          color: "#3D2C20",
          background: "transparent",
          border: "none",
          outline: "none",
        }}
      />

      {expanded && (
        <div style={{ padding: "0 12px 12px", borderTop: "1px solid #EDE4D4" }}>
          {/* Context chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px 0 8px" }}>
            {contexts.map((ctx) => {
              const selected = ctx.id === contextId;
              const color = getContextColor(ctx.priority);
              return (
                <button
                  key={ctx.id}
                  onMouseDown={(e) => { e.preventDefault(); setContextId(ctx.id); }}
                  data-selected={String(selected)}
                  style={{
                    borderRadius: "4px",
                    padding: "4px 10px",
                    fontFamily: "var(--font-lexend)",
                    fontWeight: 400,
                    fontSize: "13px",
                    border: `1.5px solid ${selected ? color.band : "#EDE4D4"}`,
                    background: selected ? color.bg : "#FAF6EE",
                    color: selected ? color.text : "#3D2C20",
                    cursor: "pointer",
                  }}
                >
                  {ctx.label}
                </button>
              );
            })}
          </div>

          {/* Due date presets */}
          <div style={{ display: "flex", gap: "6px" }}>
            {DUE_PRESETS.map((p) => (
              <button
                key={p.value}
                onMouseDown={(e) => { e.preventDefault(); setDue(due === p.value ? null : p.value); }}
                style={{
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontFamily: "var(--font-lexend)",
                  fontWeight: 400,
                  fontSize: "12px",
                  border: `1px solid ${due === p.value ? "#F0956A" : "#EDE4D4"}`,
                  background: due === p.value ? "#FDE8D8" : "#FAF6EE",
                  color: "#3D2C20",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
