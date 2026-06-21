"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthLoading } from "@/components/auth-loading";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { ScreenBio } from "@/components/onboarding/screen-bio";
import { ScreenContexts } from "@/components/onboarding/screen-contexts";
import { ScreenNonNegotiables } from "@/components/onboarding/screen-non-negotiables";
import { ScreenTypicalWeek } from "@/components/onboarding/screen-typical-week";
import { ScreenFirstTask } from "@/components/onboarding/screen-first-task";
import { HoldingScreen } from "@/components/onboarding/holding-screen";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import type { Context, SchedulePriors } from "@/lib/types";

const MORNING_WINDOW_TO_TIME: Record<string, string> = {
  "before-9am": "07:30",
  "9-11am": "09:00",
  "after-11am": "10:30",
  varies: "08:00",
};

export default function OnboardingPage() {
  const { firebaseUser, userDoc, loading } = useAuth();
  const router = useRouter();

  const [localActualStep, setLocalActualStep] = useState<number | null>(null);
  const [visualStep, setVisualStep] = useState<number | null>(null);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) { router.replace("/"); return; }
    if (userDoc?.onboardingComplete) { router.replace("/today"); return; }
    if (localActualStep === null && userDoc) {
      setLocalActualStep(userDoc.onboardingStep);
      setVisualStep(userDoc.onboardingStep);
    }
  }, [loading, firebaseUser, userDoc, router, localActualStep]);

  // Load contexts from Firestore when resuming past step 2
  useEffect(() => {
    if (!firebaseUser || !localActualStep || localActualStep < 3) return;
    if (contexts.length > 0) return;
    getDocs(collection(db, "users", firebaseUser.uid, "contexts")).then((snap) => {
      setContexts(snap.docs.map((d) => d.data() as Context));
    });
  }, [firebaseUser, localActualStep, contexts.length]);

  if (loading || visualStep === null || localActualStep === null) return <AuthLoading />;
  if (!firebaseUser || !userDoc) return <AuthLoading />;

  async function advanceVisual() {
    const next = visualStep! + 1;
    if (visualStep! >= localActualStep!) {
      await updateDoc(doc(db, "users", firebaseUser!.uid), { onboardingStep: next });
      setLocalActualStep(next);
    }
    setVisualStep(next);
  }

  async function handleBioAdvance(bio: string) {
    setAdvancing(true);
    try {
      if (visualStep! >= localActualStep!) {
        await updateDoc(doc(db, "users", firebaseUser!.uid), { bio });
      }
      await advanceVisual();
    } finally { setAdvancing(false); }
  }

  async function handleContextsAdvance(newContexts: { label: string; description: string }[]) {
    setAdvancing(true);
    try {
      if (visualStep! >= localActualStep!) {
        const batch = writeBatch(db);
        const now = Timestamp.now();
        const ref = collection(db, "users", firebaseUser!.uid, "contexts");
        const created: Context[] = newContexts.map((c, i) => {
          const docRef = doc(ref);
          const ctx: Context = {
            id: docRef.id,
            label: c.label,
            previousLabel: null,
            description: c.description,
            isNonNegotiable: false,
            nonNegotiableDetail: null,
            priority: i + 1,
            status: "active",
            lastFocusedAt: null,
            createdAt: now,
          };
          batch.set(docRef, ctx);
          return ctx;
        });
        await batch.commit();
        setContexts(created);
      }
      await advanceVisual();
    } finally { setAdvancing(false); }
  }

  async function handleNonNegsAdvance(selections: { contextId: string; detail: string }[]) {
    setAdvancing(true);
    try {
      if (visualStep! >= localActualStep!) {
        const batch = writeBatch(db);
        for (const sel of selections) {
          batch.update(doc(db, "users", firebaseUser!.uid, "contexts", sel.contextId), {
            isNonNegotiable: true,
            nonNegotiableDetail: sel.detail || null,
          });
        }
        await batch.commit();
      }
      await advanceVisual();
    } finally { setAdvancing(false); }
  }

  async function handleTypicalWeekAdvance(priors: SchedulePriors) {
    setAdvancing(true);
    try {
      if (visualStep! >= localActualStep!) {
        await updateDoc(doc(db, "users", firebaseUser!.uid), {
          schedulePriors: priors,
          notificationTime: MORNING_WINDOW_TO_TIME[priors.morningWindow],
        });
      }
      await advanceVisual();
    } finally { setAdvancing(false); }
  }

  async function handleFirstTaskAdvance(task: { title: string; contextId: string }) {
    setAdvancing(true);
    try {
      if (visualStep! >= localActualStep!) {
        await addDoc(collection(db, "users", firebaseUser!.uid, "tasks"), {
          title: task.title,
          contextId: task.contextId,
          status: "inbox",
          dueDate: null,
          energyRequired: null,
          energyOverridden: false,
          energyOverrideAt: null,
          energyOverrideValue: null,
          estimatedMins: null,
          promptVersion: null,
          snoozedUntil: null,
          snoozeCount: 0,
          pickedCount: 0,
          completedAt: null,
          completedFrom: null,
          createdAt: Timestamp.now(),
        });
      }
      await completeOnboarding();
    } finally { setAdvancing(false); }
  }

  async function completeOnboarding() {
    await updateDoc(doc(db, "users", firebaseUser!.uid), {
      onboardingStep: 6,
      onboardingComplete: true,
      onboardingCompletedAt: Timestamp.now(),
    });
    setLocalActualStep(6);
    setVisualStep(6);
  }

  async function handleNotificationResponse(enabled: boolean) {
    await updateDoc(doc(db, "users", firebaseUser!.uid), { notificationsEnabled: enabled });
  }

  if (visualStep > 5) {
    return <HoldingScreen onNotificationResponse={handleNotificationResponse} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF6EE" }}>
      <ProgressBar current={visualStep} total={5} />
      {visualStep === 1 && (
        <ScreenBio
          initialValue={userDoc.bio}
          onAdvance={handleBioAdvance}
          onBack={() => {}}
          advancing={advancing}
        />
      )}
      {visualStep === 2 && (
        <ScreenContexts
          onAdvance={handleContextsAdvance}
          onBack={() => setVisualStep(1)}
          advancing={advancing}
        />
      )}
      {visualStep === 3 && (
        <ScreenNonNegotiables
          contexts={contexts}
          onAdvance={handleNonNegsAdvance}
          onSkip={() => advanceVisual()}
          onBack={() => setVisualStep(2)}
          advancing={advancing}
        />
      )}
      {visualStep === 4 && (
        <ScreenTypicalWeek
          onAdvance={handleTypicalWeekAdvance}
          onBack={() => setVisualStep(3)}
          advancing={advancing}
        />
      )}
      {visualStep === 5 && (
        <ScreenFirstTask
          contexts={contexts}
          onAdvance={handleFirstTaskAdvance}
          onSkip={completeOnboarding}
          onBack={() => setVisualStep(4)}
          advancing={advancing}
        />
      )}
    </div>
  );
}
