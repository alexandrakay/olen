"use client";

import { useState } from "react";
import { getContextColor } from "@/lib/context-colors";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import type { Checkin, Task, Context } from "@/lib/types";

interface Props {
  checkin: Checkin;
  pickedTask: Task | null;
  pickedContext: Context | null;
  uid: string;
  onDone?: () => void;
}

export function MidDayView({ checkin, pickedTask, pickedContext, uid, onDone }: Props) {
  const [markedDone, setMarkedDone] = useState(false);

  const skipped = checkin.userAccepted === false;
  const context = pickedContext;
  const color = context ? getContextColor(context.priority) : null;

  async function handleMarkDone() {
    if (!pickedTask) return;
    // Does NOT update lastFocusedAt — only accepted morning pick does that
    await updateDoc(doc(db, "users", uid, "tasks", pickedTask.id), {
      status: "done",
      completedAt: Timestamp.now(),
      completedFrom: "mid-day",
    });
    setMarkedDone(true);
    onDone?.();
  }

  if (markedDone) {
    return (
      <div>
        <p style={{
          fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "28px",
          color: "#3D2C20", margin: "0 0 24px",
        }}>
          Done.
        </p>
        <a href="/inbox" style={{
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px",
          color: "rgba(61,44,32,0.5)", textDecoration: "none",
        }}>
          See your inbox →
        </a>
      </div>
    );
  }

  if (skipped) {
    return (
      <div>
        <p style={{
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "18px",
          color: "#3D2C20", margin: "0 0 24px",
        }}>
          Take it easy today.
        </p>
        <a href="/inbox" style={{
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px",
          color: "rgba(61,44,32,0.5)", textDecoration: "none",
        }}>
          See your inbox →
        </a>
      </div>
    );
  }

  const displayTitle = pickedTask?.title ?? context?.label ?? "";

  return (
    <div>
      {/* Persisted pick card */}
      {color && (
        <div style={{
          borderRadius: "12px",
          border: `1.5px solid ${color.band}`,
          background: color.bg,
          overflow: "hidden",
          marginBottom: "20px",
        }}>
          <div style={{ height: "4px", background: color.band }} />
          <div style={{ padding: "20px" }}>
            {context && (
              <p style={{
                fontFamily: "var(--font-lexend)", fontWeight: 500, fontSize: "10px",
                color: color.band, textTransform: "uppercase", letterSpacing: "0.1em",
                margin: "0 0 8px",
              }}>
                {context.label}
              </p>
            )}
            <p style={{
              fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "20px",
              color: color.text, margin: "0 0 10px", lineHeight: 1.25,
            }}>
              {displayTitle}
            </p>
            {checkin.pickedSuggestion && (
              <p style={{
                fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px",
                color: color.text, opacity: 0.75, margin: 0, lineHeight: 1.5,
              }}>
                {checkin.pickedSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mark done — only for task picks, not context picks */}
      {pickedTask && (
        <button
          onClick={handleMarkDone}
          style={{
            display: "block", width: "100%", borderRadius: "8px",
            background: "#F0956A", padding: "14px",
            color: "#FAF6EE", border: "none", cursor: "pointer",
            fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "16px",
            marginBottom: "16px",
          }}
        >
          Mark done
        </button>
      )}

      {/* Mid-day swap edge case: if user goes to inbox and does a different task,
          Q1 on Download still references original pickedTaskId from checkin. */}
      <a href="/inbox" style={{
        display: "block",
        fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px",
        color: "rgba(61,44,32,0.5)", textDecoration: "none",
      }}>
        See your inbox →
      </a>
    </div>
  );
}
