"use client";

import { useState } from "react";
import { getContextColor } from "@/lib/context-colors";
import type { Task, Context, EnergyLevel } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

interface Props {
  task: Task;
  context: Context;
  contexts: Context[];
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onComplete: (taskId: string) => void;
  onArchive: (taskId: string) => void;
}

const ENERGY_OPTIONS: { label: string; value: EnergyLevel }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const EST_OPTIONS: { label: string; value: NonNullable<Task["estimatedMins"]> }[] = [
  { label: "20 min", value: 20 },
  { label: "45 min", value: 45 },
  { label: "1–2 hr", value: 75 },
  { label: "2 hr", value: 120 },
  { label: "2+ hr", value: 150 },
];

export function TaskDetail({
  task,
  context,
  contexts,
  onClose,
  onUpdate,
  onComplete,
  onArchive,
}: Props) {
  const [title, setTitle] = useState(task.title);
  const [selectedContextId, setSelectedContextId] = useState(task.contextId);
  const activeEnergy = task.energyOverridden ? task.energyOverrideValue : task.energyRequired;
  const color = getContextColor(context.priority);

  function handleTitleBlur() {
    if (title.trim() && title.trim() !== task.title) {
      onUpdate(task.id, { title: title.trim() });
    }
  }

  function handleEnergyOverride(value: EnergyLevel) {
    onUpdate(task.id, {
      energyOverridden: true,
      energyOverrideValue: value,
      energyOverrideAt: Timestamp.now(),
    });
  }

  function handleContextChange(ctxId: string) {
    setSelectedContextId(ctxId);
    onUpdate(task.id, { contextId: ctxId });
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      background: "#FAF6EE",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #EDE4D4",
      }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px", color: "rgba(61,44,32,0.5)", padding: 0 }}>
          ← Back
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {/* Context chip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
          {contexts.map((ctx) => {
            const sel = ctx.id === selectedContextId;
            const c = getContextColor(ctx.priority);
            return (
              <button
                key={ctx.id}
                onClick={() => handleContextChange(ctx.id)}
                style={{
                  borderRadius: "4px",
                  padding: "5px 12px",
                  fontFamily: "var(--font-lexend)",
                  fontWeight: 400,
                  fontSize: "13px",
                  border: `1.5px solid ${sel ? c.band : "#EDE4D4"}`,
                  background: sel ? c.bg : "#FAF6EE",
                  color: sel ? c.text : "#3D2C20",
                  cursor: "pointer",
                }}
              >
                {ctx.label}
              </button>
            );
          })}
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "var(--font-outfit)",
            fontWeight: 500,
            fontSize: "22px",
            color: "#3D2C20",
            background: "transparent",
            border: "none",
            outline: "none",
            marginBottom: "24px",
            padding: 0,
          }}
        />

        {/* Energy */}
        <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px", color: "#F0956A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
          Energy
        </p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {ENERGY_OPTIONS.map((o) => {
            const sel = activeEnergy === o.value;
            return (
              <button
                key={o.value}
                onClick={() => handleEnergyOverride(o.value)}
                style={{
                  borderRadius: "4px",
                  padding: "6px 14px",
                  fontFamily: "var(--font-lexend)",
                  fontWeight: 400,
                  fontSize: "14px",
                  border: `1.5px solid ${sel ? "#F0956A" : "#EDE4D4"}`,
                  background: sel ? "#FDE8D8" : "#FAF6EE",
                  color: "#3D2C20",
                  cursor: "pointer",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Estimated time */}
        <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px", color: "#F0956A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
          Time estimate
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
          {EST_OPTIONS.map((o) => {
            const sel = task.estimatedMins === o.value;
            return (
              <button
                key={o.value}
                onClick={() => onUpdate(task.id, { estimatedMins: o.value })}
                style={{
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontFamily: "var(--font-lexend)",
                  fontWeight: 400,
                  fontSize: "13px",
                  border: `1.5px solid ${sel ? "#F0956A" : "#EDE4D4"}`,
                  background: sel ? "#FDE8D8" : "#FAF6EE",
                  color: "#3D2C20",
                  cursor: "pointer",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div style={{ borderTop: "1px solid #EDE4D4", marginBottom: "20px" }} />

        {/* Actions */}
        <button
          onClick={() => onComplete(task.id)}
          style={{
            display: "block",
            width: "100%",
            borderRadius: "8px",
            background: "#F0956A",
            padding: "14px",
            color: "#FAF6EE",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-lexend)",
            fontWeight: 400,
            fontSize: "16px",
            marginBottom: "12px",
          }}
        >
          Mark done
        </button>

        <button
          onClick={() => onArchive(task.id)}
          style={{
            display: "block",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-lexend)",
            fontWeight: 300,
            fontSize: "14px",
            color: "rgba(61,44,32,0.4)",
            padding: "8px 0",
          }}
        >
          Archive
        </button>
      </div>
    </div>
  );
}
