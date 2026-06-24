"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { PickCard } from "@/components/today/pick-card";
import { PickReward } from "@/components/today/pick-reward";
import { generatePickText } from "@/app/actions/generate-pick-text";
import { fallbackPickText } from "@/lib/pick-text";
import type { PickTextInput } from "@/lib/pick-text";
import { getContextColor } from "@/lib/context-colors";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import type { ScoringResult, ScoredCandidate } from "@/lib/types";

interface Props {
  scoringResult: ScoringResult;
  checkinDate: string;
  uid: string;
  bio: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  timeAvailableMins: 20 | 45 | 75 | 120;
  completedDownloads?: number;
  onAccepted: (candidate: ScoredCandidate, pickText: string) => void;
  onSkip: () => void;
  onBrowse?: () => void;
  /** Pass false to disable the celebration burst (reduced motion). */
  celebrate?: boolean;
}

type FlowState = "picking" | "post-acceptance" | "third-rejection";

export function PickCardFlow({
  scoringResult,
  checkinDate,
  uid,
  bio,
  energyLevel,
  timeAvailableMins,
  completedDownloads = 0,
  onAccepted,
  onSkip,
  onBrowse,
  celebrate = true,
}: Props) {
  const { queue } = scoringResult;
  const [pickIndex, setPickIndex] = useState(0);
  const [flowState, setFlowState] = useState<FlowState>("picking");
  const [pickTexts, setPickTexts] = useState<Record<number, string>>({});
  const [acceptedCandidate, setAcceptedCandidate] = useState<ScoredCandidate | null>(null);
  const [acceptedPickText, setAcceptedPickText] = useState("");
  const generatingRef = useRef<Set<number>>(new Set());

  const now = useRef(new Date());

  function toPickTextInput(candidate: ScoredCandidate): PickTextInput {
    const daysSinceLastFocused =
      candidate.type === "context" && candidate.context.lastFocusedAt
        ? Math.round(
            (now.current.getTime() - candidate.context.lastFocusedAt.toDate().getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;
    return {
      type: candidate.type,
      taskTitle: candidate.task?.title ?? null,
      taskEstimatedMins: candidate.task?.estimatedMins ?? null,
      contextLabel: candidate.context.label,
      contextDescription: candidate.context.description,
      daysSinceLastFocused,
    };
  }

  async function fetchPickText(index: number, candidate: ScoredCandidate) {
    if (generatingRef.current.has(index)) return;
    generatingRef.current.add(index);

    const { text } = await generatePickText(
      toPickTextInput(candidate), bio, energyLevel, timeAvailableMins, completedDownloads,
    );
    setPickTexts((prev) => ({ ...prev, [index]: text }));
  }

  // Preload pick text for current and next candidate
  useEffect(() => {
    for (let i = pickIndex; i < Math.min(pickIndex + 2, queue.length); i++) {
      if (queue[i] && pickTexts[i] === undefined) {
        fetchPickText(i, queue[i]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickIndex, queue]);

  const candidate = queue[pickIndex];

  function currentPickText(): string {
    return pickTexts[pickIndex] ?? fallbackPickText(toPickTextInput(candidate), energyLevel, timeAvailableMins);
  }

  async function handleAccept() {
    const candidate = queue[pickIndex];
    const text = currentPickText();
    const position = (pickIndex + 1) as 1 | 2 | 3;

    setAcceptedCandidate(candidate);
    setAcceptedPickText(text);
    setFlowState("post-acceptance");

    // Write checkin acceptance fields
    const checkinRef = doc(db, "users", uid, "checkins", checkinDate);
    const updates: Record<string, unknown> = {
      userAccepted: true,
      pickedSuggestion: text,
      pickPosition: position,
      promptVersion: "pick-v1",
    };

    if (candidate.type === "task") {
      updates.pickedTaskId = candidate.task!.id;
    } else {
      updates.pickedContextId = candidate.context.id;
    }

    // Update lastFocusedAt on accepted context (morning pick only)
    await Promise.all([
      updateDoc(checkinRef, updates),
      updateDoc(doc(db, "users", uid, "contexts", candidate.context.id), {
        lastFocusedAt: Timestamp.now(),
      }),
    ]);
  }

  async function handleReject() {
    const position = (pickIndex + 1) as 1 | 2 | 3;
    const checkinRef = doc(db, "users", uid, "checkins", checkinDate);

    // Log rejection with pickPosition
    await updateDoc(checkinRef, {
      userAccepted: false,
      pickPosition: position,
    });

    const nextIndex = pickIndex + 1;
    if (nextIndex >= queue.length) {
      setFlowState("third-rejection");
    } else {
      setPickIndex(nextIndex);
    }
  }

  async function handlePostAcceptanceSubmit(mins: 20 | 45 | 75 | 120) {
    if (acceptedCandidate?.type === "task" && acceptedCandidate.task) {
      await updateDoc(
        doc(db, "users", uid, "tasks", acceptedCandidate.task.id),
        { estimatedMins: mins },
      );
    }
    onAccepted(acceptedCandidate!, acceptedPickText);
  }

  function handlePostAcceptanceSkip() {
    onAccepted(acceptedCandidate!, acceptedPickText);
  }

  async function handleCallIt() {
    await updateDoc(doc(db, "users", uid, "checkins", checkinDate), {
      userAccepted: false,
      pickPosition: null,
    });
    onSkip();
  }

  if (flowState === "post-acceptance" && acceptedCandidate) {
    const color = getContextColor(acceptedCandidate.context.priority);
    const title =
      acceptedCandidate.type === "task"
        ? acceptedCandidate.task!.title
        : acceptedCandidate.context.label;
    return (
      <PickReward
        bandColor={color.band}
        cardBg={color.bg}
        title={title}
        celebrate={celebrate}
        onSubmit={handlePostAcceptanceSubmit}
        onSkip={handlePostAcceptanceSkip}
      />
    );
  }

  if (flowState === "third-rejection") {
    return (
      <div>
        <p style={{
          fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "20px",
          color: "#3D2C20", margin: "0 0 8px", lineHeight: 1.3,
        }}>
          Nothing&apos;s clicking today.
        </p>
        <p style={{
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px",
          color: "rgba(61,44,32,0.6)", margin: "0 0 28px",
        }}>
          That&apos;s fine — want to call it or keep looking?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {onBrowse && (
            <button
              onClick={onBrowse}
              style={{
                borderRadius: "8px", background: "#FAF6EE", padding: "14px",
                color: "#3D2C20", border: "1.5px solid #EDE4D4", cursor: "pointer",
                fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "16px",
              }}
            >
              Keep looking
            </button>
          )}
          <button
            onClick={handleCallIt}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "10px 0",
              fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px",
              color: "rgba(61,44,32,0.4)",
            }}
          >
            Call it
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  // AnimatePresence lets the rejected card slide out as the next springs in.
  return (
    <AnimatePresence mode="wait">
      <PickCard
        key={pickIndex}
        candidate={candidate}
        pickText={currentPickText()}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </AnimatePresence>
  );
}
