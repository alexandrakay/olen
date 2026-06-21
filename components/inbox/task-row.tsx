"use client";

import { useRef, useState } from "react";
import { getContextColor } from "@/lib/context-colors";
import type { Task, Context } from "@/lib/types";

interface Props {
  task: Task;
  context: Context;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
  onTap: (task: Task) => void;
}

const SWIPE_THRESHOLD = 80;

function formatDue(ts: NonNullable<Task["dueDate"]>): string {
  const d = ts.toDate();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TaskRow({ task, context, onComplete, onSnooze, onTap }: Props) {
  const color = getContextColor(context.priority);
  const startX = useRef<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  function handlePointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setSwiping(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    setOffsetX(e.clientX - startX.current);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    setOffsetX(0);
    setSwiping(false);
    startX.current = null;

    if (delta >= SWIPE_THRESHOLD) {
      onComplete(task.id);
    } else if (delta <= -SWIPE_THRESHOLD) {
      onSnooze(task.id);
    }
  }

  function handleClick() {
    if (Math.abs(offsetX) < 5) onTap(task);
  }

  const isSnoozed = task.status === "snoozed";

  return (
    <div
      data-testid="task-row"
      data-snoozed={String(isSnoozed)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "stretch",
        borderRadius: "8px",
        border: "1px solid #EDE4D4",
        background: "#FAF6EE",
        overflow: "hidden",
        cursor: "pointer",
        transform: swiping ? `translateX(${offsetX}px)` : undefined,
        transition: swiping ? "none" : "transform 0.2s",
        opacity: isSnoozed ? 0.5 : 1,
        userSelect: "none",
        touchAction: "pan-y",
      }}
    >
      {/* Color band */}
      <div style={{ width: "4px", flexShrink: 0, background: color.band }} />

      {/* Content */}
      <div style={{ flex: 1, padding: "10px 12px" }}>
        <p style={{
          fontFamily: "var(--font-lexend)",
          fontWeight: 500,
          fontSize: "10px",
          color: color.band,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          margin: "0 0 4px",
        }}>
          {context.label.toUpperCase()}
        </p>
        <p style={{
          fontFamily: "var(--font-outfit)",
          fontWeight: 500,
          fontSize: "15px",
          color: "#3D2C20",
          margin: 0,
          lineHeight: 1.4,
        }}>
          {task.title}
        </p>
        {task.dueDate && (
          <p style={{
            fontFamily: "var(--font-lexend)",
            fontWeight: 300,
            fontSize: "12px",
            color: "rgba(61,44,32,0.5)",
            margin: "4px 0 0",
          }}>
            {formatDue(task.dueDate)}
          </p>
        )}
      </div>
    </div>
  );
}
