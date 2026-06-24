"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthLoading } from "@/components/auth-loading";
import { NavBar } from "@/components/nav-bar";
import { TodayShell } from "@/components/today/today-shell";
import { MorningCheckin } from "@/components/today/morning-checkin";
import { DayZero } from "@/components/today/day-zero";
import { MorningUnavailable } from "@/components/today/morning-unavailable";
import { PickCardFlow } from "@/components/today/pick-card-flow";
import { MidDayView } from "@/components/today/midday-view";
import { DownloadFlow } from "@/components/today/download-flow";
import { getAppState, type AppState } from "@/lib/app-state";
import { computeQueue } from "@/lib/scoring";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import type { Checkin, Task, Context, ScoringResult, ScoredCandidate } from "@/lib/types";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TodayPage() {
  const { firebaseUser, userDoc, loading } = useAuth();
  const router = useRouter();

  const [appState, setAppState] = useState<AppState | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<Checkin | null>(null);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [completedDownloads, setCompletedDownloads] = useState(0);
  const [acceptedCandidate, setAcceptedCandidate] = useState<ScoredCandidate | null>(null);
  const [pickedSuggestion, setPickedSuggestion] = useState("");
  const [skipped, setSkipped] = useState(false);
  const [pickedTask, setPickedTask] = useState<Task | null>(null);
  const [pickedContext, setPickedContext] = useState<Context | null>(null);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [downloadDone, setDownloadDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEvening = new Date().getHours() >= 18;
  const checkinRef = useRef<Checkin | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) { router.replace("/"); return; }
    loadState();
  }, [loading, firebaseUser]);

  async function loadState() {
    const uid = firebaseUser!.uid;
    const dateStr = todayStr();

    const [checkinSnap, anySnap, downloadsSnap, contextsSnap] = await Promise.all([
      getDoc(doc(db, "users", uid, "checkins", dateStr)),
      getDocs(query(collection(db, "users", uid, "checkins"), limit(1))),
      getDocs(collection(db, "users", uid, "downloads")),
      getDocs(collection(db, "users", uid, "contexts")),
    ]);
    setContexts(
      contextsSnap.docs
        .map((d) => ({ ...d.data(), id: d.id }) as Context)
        .filter((c) => c.status === "active")
    );

    const checkin = checkinSnap.exists() ? (checkinSnap.data() as Checkin) : null;
    checkinRef.current = checkin;
    setTodayCheckin(checkin);
    setCompletedDownloads(downloadsSnap.size);

    const hasAny = !anySnap.empty;
    const state = getAppState(new Date(), checkin, hasAny);
    setAppState(state);

    // Restore mid-day sub-state from persisted checkin
    if (checkin) {
      if (checkin.userAccepted === true) {
        setPickedSuggestion(checkin.pickedSuggestion);
        // Load picked task + context for mid-day display
        const loads: Promise<void>[] = [];
        if (checkin.pickedTaskId) {
          loads.push(
            getDoc(doc(db, "users", uid, "tasks", checkin.pickedTaskId)).then((s) => {
              if (s.exists()) setPickedTask({ ...s.data(), id: s.id } as Task);
            })
          );
        }
        const ctxId = checkin.pickedContextId ?? null;
        if (ctxId) {
          loads.push(
            getDoc(doc(db, "users", uid, "contexts", ctxId)).then((s) => {
              if (s.exists()) setPickedContext({ ...s.data(), id: s.id } as Context);
            })
          );
        } else if (checkin.pickedTaskId) {
          // Context loaded after task — wait for task then load its context
          loads.push(
            getDoc(doc(db, "users", uid, "tasks", checkin.pickedTaskId)).then(async (s) => {
              if (s.exists()) {
                const t = { ...s.data(), id: s.id } as Task;
                const cs = await getDoc(doc(db, "users", uid, "contexts", t.contextId));
                if (cs.exists()) setPickedContext({ ...cs.data(), id: cs.id } as Context);
              }
            })
          );
        }
        await Promise.all(loads);
      } else if (checkin.userAccepted === false) {
        setSkipped(true);
      }
    }
  }

  async function loadScoringResult(checkin: Checkin) {
    const uid = firebaseUser!.uid;
    const [tasksSnap, contextsSnap] = await Promise.all([
      getDocs(query(
        collection(db, "users", uid, "tasks"),
        where("status", "in", ["inbox", "active"]),
      )),
      getDocs(collection(db, "users", uid, "contexts")),
    ]);

    const tasks = tasksSnap.docs.map((d) => ({ ...d.data(), id: d.id }) as Task);
    const loadedContexts = contextsSnap.docs
      .map((d) => ({ ...d.data(), id: d.id }) as Context)
      .filter((c) => c.status === "active");
    setContexts(loadedContexts);
    const contexts = loadedContexts;

    const result = computeQueue(tasks, contexts, {
      now: new Date(),
      timeAvailableMins: checkin.timeAvailableMins,
      energyLevel: checkin.energyLevel,
      dataMaturity: Math.min(1, completedDownloads / 60),
    });

    setScoringResult(result);
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
    checkinRef.current = checkin;
    setTodayCheckin(checkin);
    await loadScoringResult(checkin);
    setAppState("mid-day");
    setSubmitting(false);
  }

  function handleAccepted(candidate: ScoredCandidate, text: string) {
    setAcceptedCandidate(candidate);
    setPickedSuggestion(text);
    if (candidate.type === "task") setPickedTask(candidate.task!);
    setPickedContext(candidate.context);
  }

  function handleSkip() {
    setSkipped(true);
  }

  if (loading || appState === null) return <AuthLoading />;

  const bg = isEvening ? "var(--color-plum)" : "#FAF6EE";

  // Mid-day: determine sub-state
  const showPickFlow = appState === "mid-day" && !acceptedCandidate && !skipped;
  const showMidDay = appState === "mid-day" && (!!acceptedCandidate || !!skipped);

  // Ensure scoring result is loaded when entering pick flow
  if (showPickFlow && !scoringResult && todayCheckin) {
    loadScoringResult(todayCheckin);
  }

  return (
    <div style={{ minHeight: "100dvh", background: bg }}>

      {appState === "morning" && (
        <TodayShell
          accent={isEvening ? "#B8A4D8" : "#F0956A"}
          sceneBg={isEvening ? "#241A28" : "#F4ECDC"}
          sceneText={isEvening ? "#FAF6EE" : "#3D2C20"}
          caption={isEvening ? "let's figure out today" : "one thing at a time"}
        >
          <MorningCheckin onSubmit={handleCheckinSubmit} isEvening={isEvening} />
        </TodayShell>
      )}

      {showPickFlow && (
        <TodayShell caption="here's where I'd start">
          {scoringResult && !scoringResult.empty ? (
            <PickCardFlow
              scoringResult={scoringResult}
              checkinDate={todayStr()}
              uid={firebaseUser!.uid}
              bio={userDoc?.bio ?? ""}
              energyLevel={todayCheckin!.energyLevel}
              timeAvailableMins={todayCheckin!.timeAvailableMins}
              completedDownloads={completedDownloads}
              onAccepted={handleAccepted}
              onSkip={handleSkip}
              onBrowse={() => router.push("/inbox")}
            />
          ) : scoringResult?.empty ? (
            <div>
              <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "20px", color: "#3D2C20", margin: "0 0 8px" }}>
                Your inbox is clear.
              </p>
              <p style={{ fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px", color: "rgba(61,44,32,0.6)", margin: 0 }}>
                Add something to your inbox to get a pick tomorrow.
              </p>
            </div>
          ) : (
            <AuthLoading />
          )}
        </TodayShell>
      )}

      {showMidDay && todayCheckin && (
        <TodayShell>
          <MidDayView
            checkin={todayCheckin}
            pickedTask={pickedTask}
            pickedContext={pickedContext}
            uid={firebaseUser!.uid}
          />
        </TodayShell>
      )}

      {appState === "day-zero" && (
        <TodayShell>
          <DayZero />
        </TodayShell>
      )}

      {appState === "morning-unavailable" && (
        <TodayShell>
          <MorningUnavailable />
        </TodayShell>
      )}

      {appState === "evening" && (
        <TodayShell accent="#B8A4D8" sceneBg="#241A28" sceneText="#FAF6EE" caption="winding down">
          {downloadDone || !todayCheckin ? (
            // Evening holding state — Download complete or day-zero evening
            <div>
              <p style={{
                fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "22px",
                color: "#FAF6EE", margin: "0 0 8px",
              }}>
                Good evening.
              </p>
              <p style={{
                fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px",
                color: "rgba(250,246,238,0.5)", margin: 0,
              }}>
                See you tomorrow.
              </p>
            </div>
          ) : (
            <DownloadFlow
              checkin={todayCheckin}
              pickedLabel={
                pickedTask?.title ??
                (pickedContext?.label ?? null)
              }
              pickedTask={pickedTask}
              contexts={contexts}
              uid={firebaseUser!.uid}
              onComplete={() => setDownloadDone(true)}
            />
          )}
        </TodayShell>
      )}

      <NavBar evening={isEvening} />
    </div>
  );
}
