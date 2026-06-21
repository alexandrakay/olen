"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthLoading } from "@/components/auth-loading";
import { NavBar } from "@/components/nav-bar";
import { TaskRow } from "@/components/inbox/task-row";
import { AddTaskForm } from "@/components/inbox/add-task-form";
import { TaskDetail } from "@/components/inbox/task-detail";
import { SnoozeSheet } from "@/components/inbox/snooze-sheet";
import { SomedaySection } from "@/components/inbox/someday-section";
import { UndoToast } from "@/components/inbox/undo-toast";
import { getContextColor } from "@/lib/context-colors";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import type { Task, Context } from "@/lib/types";

// Inbox sort: neglect + urgency only
function neglectDays(ctx: Context, now: Date): number {
  if (!ctx.lastFocusedAt) return 7;
  const days = (now.getTime() - ctx.lastFocusedAt.toDate().getTime()) / (1000 * 60 * 60 * 24);
  return Math.min(days, 7);
}

function urgencyScore(task: Task, now: Date): number {
  if (!task.dueDate) return 0;
  const daysUntil = Math.round(
    (task.dueDate.toDate().setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  if (daysUntil <= 0) return 10;
  if (daysUntil === 1) return 2;
  if (daysUntil <= 7) return 1.5;
  return 0;
}

function sortInbox(tasks: Task[], contexts: Context[], now: Date): Task[] {
  const ctxMap = new Map(contexts.map((c) => [c.id, c]));
  return [...tasks].sort((a, b) => {
    const ctxA = ctxMap.get(a.contextId);
    const ctxB = ctxMap.get(b.contextId);
    const scoreA = (ctxA ? neglectDays(ctxA, now) / 7 : 1) + urgencyScore(a, now);
    const scoreB = (ctxB ? neglectDays(ctxB, now) / 7 : 1) + urgencyScore(b, now);
    return scoreB - scoreA;
  });
}

function tomorrowMidnight(): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(d);
}

function dueDateFromPreset(preset: "today" | "tomorrow" | "this-week" | null): Timestamp | null {
  if (!preset) return null;
  const d = new Date();
  if (preset === "today") { d.setHours(23, 59, 59, 0); return Timestamp.fromDate(d); }
  if (preset === "tomorrow") { d.setDate(d.getDate() + 1); d.setHours(23, 59, 59, 0); return Timestamp.fromDate(d); }
  // this-week: end of Sunday
  const daysUntilSunday = 7 - d.getDay();
  d.setDate(d.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday));
  d.setHours(23, 59, 59, 0);
  return Timestamp.fromDate(d);
}

interface UndoState {
  taskId: string;
  snapshot: Partial<Task>;
  message: string;
}

export default function InboxPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [snoozeTask, setSnoozeTask] = useState<Task | null>(null);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [lastUsedContextId, setLastUsedContextId] = useState<string | undefined>(undefined);

  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());

  // Cmd+K / Cmd+N focus add task
  const addInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "n")) {
        e.preventDefault();
        addInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) { router.replace("/"); return; }
  }, [loading, firebaseUser, router]);

  // Load contexts
  useEffect(() => {
    if (!firebaseUser) return;
    getDocs(collection(db, "users", firebaseUser.uid, "contexts")).then((snap) => {
      const ctxs = snap.docs
        .map((d) => ({ ...d.data(), id: d.id }) as Context)
        .filter((c) => c.status === "active")
        .sort((a, b) => a.priority - b.priority);
      setContexts(ctxs);
    });
  }, [firebaseUser]);

  // Subscribe to tasks (inbox + snoozed + someday)
  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(
      collection(db, "users", firebaseUser.uid, "tasks"),
      where("status", "in", ["inbox", "snoozed", "someday"])
    );
    const unsub = onSnapshot(q, (snap) => {
      const ts = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Task);
      setTasks(ts);
      setDataLoading(false);
    });
    return unsub;
  }, [firebaseUser]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!firebaseUser) return;
    await updateDoc(doc(db, "users", firebaseUser.uid, "tasks", taskId), updates);
  }, [firebaseUser]);

  function animateOut(taskId: string, then: () => void) {
    setAnimatingOut((s) => new Set(s).add(taskId));
    setTimeout(() => {
      setAnimatingOut((s) => { const n = new Set(s); n.delete(taskId); return n; });
      then();
    }, 200);
  }

  async function handleComplete(taskId: string) {
    animateOut(taskId, () => {});
    await updateTask(taskId, {
      status: "done",
      completedAt: Timestamp.now(),
      completedFrom: "inbox",
    });
  }

  async function handleSnooze(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextCount = (task.snoozeCount ?? 0) + 1;

    if (nextCount >= 3) {
      setSnoozeTask(task);
      return;
    }

    animateOut(taskId, () => {});
    await updateTask(taskId, {
      status: "snoozed",
      snoozedUntil: tomorrowMidnight(),
      snoozeCount: nextCount,
    });
  }

  async function handleSnoozeAgain() {
    if (!snoozeTask) return;
    const task = snoozeTask;
    setSnoozeTask(null);
    animateOut(task.id, () => {});
    await updateTask(task.id, {
      status: "snoozed",
      snoozedUntil: tomorrowMidnight(),
      snoozeCount: 0,
    });
  }

  async function handleMoveSomeday() {
    if (!snoozeTask) return;
    const task = snoozeTask;
    setSnoozeTask(null);
    await updateTask(task.id, { status: "someday" });
  }

  async function handleRemoveFromSheet() {
    if (!snoozeTask) return;
    const task = snoozeTask;
    setSnoozeTask(null);
    const snapshot: Partial<Task> = { status: task.status, snoozeCount: task.snoozeCount };
    await updateTask(task.id, { status: "archived" });
    setUndoState({ taskId: task.id, snapshot, message: "Removed — undo" });
  }

  async function handleArchive(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const snapshot: Partial<Task> = { status: task.status };
    setActiveTask(null);
    await updateTask(taskId, { status: "archived" });
    setUndoState({ taskId, snapshot, message: "Archived — undo" });
  }

  async function handleUndo() {
    if (!undoState) return;
    await updateTask(undoState.taskId, undoState.snapshot);
    setUndoState(null);
  }

  async function handleMoveToActive(taskId: string) {
    await updateTask(taskId, { status: "inbox", snoozeCount: 0, snoozedUntil: null });
  }

  async function handleAdd(newTask: { title: string; contextId: string; dueDate: "today" | "tomorrow" | "this-week" | null }) {
    if (!firebaseUser) return;
    setLastUsedContextId(newTask.contextId);
    await addDoc(collection(db, "users", firebaseUser.uid, "tasks"), {
      title: newTask.title,
      contextId: newTask.contextId,
      status: "inbox",
      dueDate: dueDateFromPreset(newTask.dueDate),
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

  if (loading || dataLoading) return <AuthLoading />;

  const now = new Date();
  const activeInbox = tasks.filter((t) => t.status === "inbox" || t.status === "snoozed");
  const someday = tasks.filter((t) => t.status === "someday");

  const filteredActive = selectedContextId
    ? activeInbox.filter((t) => t.contextId === selectedContextId)
    : activeInbox;

  const sorted = sortInbox(filteredActive, contexts, now);

  const ctxMap = new Map(contexts.map((c) => [c.id, c]));

  // If activeTask is open, find its context
  const activeTaskContext = activeTask ? (ctxMap.get(activeTask.contextId) ?? contexts[0]) : null;

  return (
    <div style={{ minHeight: "100dvh", background: "#FAF6EE", paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{ padding: "56px 24px 0" }}>
        <p style={{
          fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: "24px",
          color: "#3D2C20", margin: "0 0 20px",
        }}>
          Inbox
        </p>

        <AddTaskForm
          contexts={contexts}
          lastUsedContextId={lastUsedContextId}
          onAdd={handleAdd}
        />
      </div>

      {/* Context filter */}
      {contexts.length > 1 && (
        <div style={{
          display: "flex", gap: "6px", overflowX: "auto", padding: "0 24px 16px",
          scrollbarWidth: "none",
        }}>
          <button
            onClick={() => setSelectedContextId(null)}
            style={{
              borderRadius: "4px", padding: "5px 12px", whiteSpace: "nowrap",
              fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "13px",
              border: `1.5px solid ${selectedContextId === null ? "#F0956A" : "#EDE4D4"}`,
              background: selectedContextId === null ? "#FDE8D8" : "#FAF6EE",
              color: "#3D2C20", cursor: "pointer",
            }}
          >
            All
          </button>
          {contexts.map((ctx) => {
            const sel = selectedContextId === ctx.id;
            const c = getContextColor(ctx.priority);
            return (
              <button
                key={ctx.id}
                onClick={() => setSelectedContextId(sel ? null : ctx.id)}
                style={{
                  borderRadius: "4px", padding: "5px 12px", whiteSpace: "nowrap",
                  fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "13px",
                  border: `1.5px solid ${sel ? c.band : "#EDE4D4"}`,
                  background: sel ? c.bg : "#FAF6EE",
                  color: sel ? c.text : "#3D2C20", cursor: "pointer",
                }}
              >
                {ctx.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Task list */}
      <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {sorted.length === 0 && someday.length === 0 && (
          <p style={{
            fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "15px",
            color: "rgba(61,44,32,0.4)", textAlign: "center", padding: "48px 0",
          }}>
            Add something you&apos;re trying to move forward.
          </p>
        )}

        {sorted.map((task) => {
          const ctx = ctxMap.get(task.contextId) ?? contexts[0];
          if (!ctx) return null;
          const out = animatingOut.has(task.id);
          return (
            <div
              key={task.id}
              style={{
                transition: "opacity 0.2s, transform 0.2s",
                opacity: out ? 0 : 1,
                transform: out ? "translateX(60px)" : undefined,
              }}
            >
              <TaskRow
                task={task}
                context={ctx}
                onComplete={handleComplete}
                onSnooze={handleSnooze}
                onTap={setActiveTask}
              />
            </div>
          );
        })}

        {someday.length > 0 && (
          <SomedaySection
            tasks={someday}
            contexts={contexts}
            onMoveToActive={handleMoveToActive}
          />
        )}
      </div>

      {/* Task detail overlay */}
      {activeTask && activeTaskContext && (
        <TaskDetail
          task={activeTask}
          context={activeTaskContext}
          contexts={contexts}
          onClose={() => setActiveTask(null)}
          onUpdate={updateTask}
          onComplete={(id) => { handleComplete(id); setActiveTask(null); }}
          onArchive={handleArchive}
        />
      )}

      {/* Third-snooze sheet */}
      {snoozeTask && (
        <SnoozeSheet
          onSnoozeAgain={handleSnoozeAgain}
          onMoveSomeday={handleMoveSomeday}
          onRemove={handleRemoveFromSheet}
          onClose={() => setSnoozeTask(null)}
        />
      )}

      {/* Undo toast */}
      {undoState && (
        <UndoToast
          message={undoState.message}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
        />
      )}

      <NavBar />
    </div>
  );
}
