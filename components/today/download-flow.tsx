"use client";

import { useState } from "react";
import { DownloadQ1 } from "@/components/today/download-q1";
import { DownloadQ2 } from "@/components/today/download-q2";
import { DownloadQ3 } from "@/components/today/download-q3";
import { DownloadNonNeg } from "@/components/today/download-nonneg";
import { getDownloadPrefill } from "@/lib/download-prefill";
import { db } from "@/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import type { Checkin, Task, Context, CompletedFocusTask, DerailerType, Download } from "@/lib/types";
import type { DownloadPrefill } from "@/lib/download-prefill";

interface Props {
  checkin: Checkin;
  pickedLabel: string | null;
  pickedTask?: Task | null;
  contexts: Context[];
  uid: string;
  onComplete: () => void;
}

type Step = "q1" | "q2" | "q3" | "nonneg" | "closing";

function needsQ3(answer: CompletedFocusTask) {
  return answer === "no" || answer === "partial";
}

// Non-neg shown when: derailer occurred AND non-neg context is non-negotiable
// and scheduled today (chaos day logic or nonNegotiableDetail hint — simplified
// to "always show when derailer present" in v1, scoped by chaoticDays post-MVP)
function getNonNegs(contexts: Context[]): Context[] {
  return contexts.filter((c) => c.isNonNegotiable && c.status === "active");
}

export function DownloadFlow({
  checkin,
  pickedLabel,
  pickedTask = null,
  contexts,
  uid,
  onComplete,
}: Props) {
  const prefill: DownloadPrefill | null = pickedTask
    ? getDownloadPrefill(checkin, pickedTask)
    : null;

  const [step, setStep] = useState<Step>("q1");
  const [q1Answer, setQ1Answer] = useState<CompletedFocusTask | null>(null);
  const [q2Answer, setQ2Answer] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [derailerType, setDerailerType] = useState<DerailerType | null>(null);
  const [derailerNote, setDerailerNote] = useState<string | null>(null);
  const [nonNegAnswers, setNonNegAnswers] = useState<Record<string, boolean | null>>({});
  const [nonNegQueue, setNonNegQueue] = useState<Context[]>([]);

  const nonNegs = getNonNegs(contexts);

  function handleQ1(answer: CompletedFocusTask) {
    setQ1Answer(answer);
    setStep("q2");
  }

  function handleQ2(energy: 1 | 2 | 3 | 4 | 5) {
    setQ2Answer(energy);
    if (needsQ3(q1Answer!)) {
      setStep("q3");
    } else {
      advanceFromQ3OrSkip(energy, null, null);
    }
  }

  function handleQ3(answer: { derailerType: DerailerType; derailerNote: string | null }) {
    setDerailerType(answer.derailerType);
    setDerailerNote(answer.derailerNote);
    // Show non-neg questions when derailer present and non-negs exist
    const pending = nonNegs;
    if (pending.length > 0) {
      setNonNegQueue(pending);
      setStep("nonneg");
    } else {
      writeAndClose(q1Answer!, q2Answer!, answer.derailerType, answer.derailerNote, {});
    }
  }

  function handleNonNeg(contextId: string, value: boolean | null) {
    const updated = { ...nonNegAnswers, [contextId]: value };
    setNonNegAnswers(updated);
    const remaining = nonNegQueue.filter((c) => c.id !== contextId);
    if (remaining.length > 0) {
      setNonNegQueue(remaining);
    } else {
      writeAndClose(q1Answer!, q2Answer!, derailerType, derailerNote, updated);
    }
  }

  function advanceFromQ3OrSkip(
    energy: 1 | 2 | 3 | 4 | 5,
    dt: DerailerType | null,
    dn: string | null,
  ) {
    writeAndClose(q1Answer!, energy, dt, dn, {});
  }

  async function writeAndClose(
    completed: CompletedFocusTask,
    energy: 1 | 2 | 3 | 4 | 5,
    dt: DerailerType | null,
    dn: string | null,
    nonNegMap: Record<string, boolean | null>,
  ) {
    setStep("closing");

    const download: Download = {
      date: checkin.date,
      completedFocusTask: completed,
      energyActual: energy,
      derailerType: dt,
      derailerNote: dn,
      nonNegotiablesProtected: nonNegMap,
      energyDelta: energy - checkin.energyLevel,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", uid, "downloads", checkin.date), download);
  }

  if (step === "closing") {
    const isYes = q1Answer === "yes";
    return (
      <div>
        <p style={{
          fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "24px",
          color: "#FAF6EE", margin: "0 0 8px",
        }}>
          {isYes ? "Nice work." : "Got it."}
        </p>
        <p style={{
          fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "16px",
          color: "rgba(250,246,238,0.6)", margin: 0,
        }}>
          See you tomorrow.
        </p>
      </div>
    );
  }

  if (step === "nonneg" && nonNegQueue.length > 0) {
    return (
      <DownloadNonNeg
        nonNeg={nonNegQueue[0]}
        onAnswer={handleNonNeg}
      />
    );
  }

  if (step === "q3") {
    return <DownloadQ3 onAnswer={handleQ3} />;
  }

  if (step === "q2") {
    return <DownloadQ2 onAnswer={handleQ2} />;
  }

  return (
    <DownloadQ1
      checkin={checkin}
      pickedLabel={pickedLabel}
      onAnswer={handleQ1}
      prefill={prefill}
    />
  );
}
