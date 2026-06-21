"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthLoading } from "@/components/auth-loading";
import { NavBar } from "@/components/nav-bar";
import { MorningCheckin } from "@/components/today/morning-checkin";
import { DayZero } from "@/components/today/day-zero";
import { MidDayPlaceholder } from "@/components/today/mid-day-placeholder";
import { MorningUnavailable } from "@/components/today/morning-unavailable";
import { getAppState, type AppState } from "@/lib/app-state";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  limit,
  Timestamp,
} from "firebase/firestore";
import type { Checkin } from "@/lib/types";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TodayPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEvening = new Date().getHours() >= 18;

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) { router.replace("/"); return; }
    loadState();
  }, [loading, firebaseUser]);

  async function loadState() {
    const uid = firebaseUser!.uid;
    const dateStr = todayStr();

    const [checkinSnap, anySnap] = await Promise.all([
      getDoc(doc(db, "users", uid, "checkins", dateStr)),
      getDocs(query(collection(db, "users", uid, "checkins"), limit(1))),
    ]);

    const todayCheckin = checkinSnap.exists() ? (checkinSnap.data() as Checkin) : null;
    const hasAny = !anySnap.empty;

    setAppState(getAppState(new Date(), todayCheckin, hasAny));
  }

  async function handleCheckinSubmit(data: {
    timeAvailableMins: 20 | 45 | 75 | 120;
    energyLevel: 1 | 2 | 3 | 4 | 5;
  }) {
    if (!firebaseUser || submitting) return;
    setSubmitting(true);

    const now = new Date();
    const dateStr = todayStr();

    const checkin: Checkin = {
      date: dateStr,
      checkinHour: now.getHours(),
      dayOfWeek: now.getDay(),
      timeAvailableMins: data.timeAvailableMins,
      energyLevel: data.energyLevel,
      pickedTaskId: null,
      pickedContextId: null,
      pickPosition: null,
      pickedSuggestion: "",
      promptVersion: "",
      userAccepted: null,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid, "checkins", dateStr), checkin);
    setAppState("mid-day");
    setSubmitting(false);
  }

  if (loading || appState === null) return <AuthLoading />;

  const bg = isEvening ? "#2A1F2E" : "#FAF6EE";

  return (
    <div style={{ minHeight: "100vh", background: bg }}>
      {appState === "morning" && (
        <MorningCheckin onSubmit={handleCheckinSubmit} />
      )}
      {appState === "mid-day" && <MidDayPlaceholder />}
      {appState === "day-zero" && <DayZero />}
      {appState === "morning-unavailable" && <MorningUnavailable />}
      {appState === "evening" && (
        <div style={{ padding: "40px 24px" }}>
          <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: "28px", color: "#FAF6EE", marginTop: 0 }}>
            olen<span style={{ color: "#B8A4D8" }}>.</span>
          </p>
          <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "18px", color: "#FAF6EE", opacity: 0.7, lineHeight: 1.6 }}>
            Download coming in issue #12.
          </p>
        </div>
      )}
      <NavBar evening={isEvening} />
    </div>
  );
}
