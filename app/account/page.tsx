"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthLoading } from "@/components/auth-loading";
import { NavBar } from "@/components/nav-bar";
import { ContextRow } from "@/components/account/context-row";
import { ContextForm } from "@/components/account/context-form";
import { ArchiveSheet } from "@/components/account/archive-sheet";
import { canAddContext, SOFT_LIMIT_WARNING } from "@/lib/context-management";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import type { Context, Task } from "@/lib/types";

interface ArchivePending {
  contextId: string;
  label: string;
  incompleteTaskCount: number;
}

export default function AccountPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  const [contexts, setContexts] = useState<Context[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [warnDismissed, setWarnDismissed] = useState(false);
  const [archivePending, setArchivePending] = useState<ArchivePending | null>(null);

  useEffect(() => {
    if (!loading && !firebaseUser) router.replace("/");
  }, [loading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(collection(db, `users/${firebaseUser.uid}/contexts`));
    return onSnapshot(q, (snap) => {
      setContexts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Context)));
    });
  }, [firebaseUser]);

  const handleUpdate = useCallback(
    async (contextId: string, payload: Partial<Context>) => {
      if (!firebaseUser) return;
      await updateDoc(doc(db, `users/${firebaseUser.uid}/contexts/${contextId}`), payload);
    },
    [firebaseUser]
  );

  const handleArchiveRequest = useCallback(
    async (contextId: string) => {
      if (!firebaseUser) return;
      const ctx = contexts.find((c) => c.id === contextId);
      if (!ctx) return;

      // Count incomplete tasks in this context
      const q = query(
        collection(db, `users/${firebaseUser.uid}/tasks`),
        where("contextId", "==", contextId),
        where("status", "in", ["inbox", "active", "snoozed", "someday"])
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        await updateDoc(doc(db, `users/${firebaseUser.uid}/contexts/${contextId}`), {
          status: "archived",
        });
      } else {
        setArchivePending({ contextId, label: ctx.label, incompleteTaskCount: snap.size });
      }
    },
    [firebaseUser, contexts]
  );

  const handleMoveAll = useCallback(
    async (targetContextId: string) => {
      if (!firebaseUser || !archivePending) return;
      const { contextId } = archivePending;

      const q = query(
        collection(db, `users/${firebaseUser.uid}/tasks`),
        where("contextId", "==", contextId),
        where("status", "in", ["inbox", "active", "snoozed", "someday"])
      );
      const snap = await getDocs(q);

      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.update(d.ref, { contextId: targetContextId });
      });
      batch.update(doc(db, `users/${firebaseUser.uid}/contexts/${contextId}`), { status: "archived" });
      await batch.commit();
      setArchivePending(null);
    },
    [firebaseUser, archivePending]
  );

  const handleCompleteAll = useCallback(async () => {
    if (!firebaseUser || !archivePending) return;
    const { contextId } = archivePending;

    const q = query(
      collection(db, `users/${firebaseUser.uid}/tasks`),
      where("contextId", "==", contextId),
      where("status", "in", ["inbox", "active", "snoozed", "someday"])
    );
    const snap = await getDocs(q);

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, { status: "done", completedAt: Timestamp.now() });
    });
    batch.update(doc(db, `users/${firebaseUser.uid}/contexts/${contextId}`), { status: "archived" });
    await batch.commit();
    setArchivePending(null);
  }, [firebaseUser, archivePending]);

  const handleAddContext = useCallback(
    async (payload: {
      label: string;
      description: string;
      isNonNegotiable: boolean;
      nonNegotiableDetail: string | null;
    }) => {
      if (!firebaseUser) return;
      const priority = contexts.filter((c) => c.status === "active").length + 1;
      await addDoc(collection(db, `users/${firebaseUser.uid}/contexts`), {
        label: payload.label,
        previousLabel: null,
        description: payload.description,
        isNonNegotiable: payload.isNonNegotiable,
        nonNegotiableDetail: payload.nonNegotiableDetail,
        priority,
        status: "active",
        lastFocusedAt: null,
        createdAt: Timestamp.now(),
      });
      setShowForm(false);
    },
    [firebaseUser, contexts]
  );

  if (loading) return <AuthLoading />;
  if (!firebaseUser) return null;

  const activeContexts = contexts.filter((c) => c.status === "active");
  const archivedContexts = contexts.filter((c) => c.status === "archived");
  const nonNegCount = activeContexts.filter((c) => c.isNonNegotiable).length;
  const { warn } = canAddContext(activeContexts.length);
  const showWarn = warn && !warnDismissed && showForm;

  const archivePendingCtx = archivePending
    ? contexts.find((c) => c.id === archivePending.contextId) ?? null
    : null;
  const otherActiveContexts = archivePending
    ? activeContexts.filter((c) => c.id !== archivePending.contextId)
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "#FAF6EE" }}>
      <div style={{ padding: "40px 24px 120px", maxWidth: "480px", margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "var(--font-outfit)",
            fontWeight: 600,
            fontSize: "28px",
            color: "#3D2C20",
            marginTop: 0,
            marginBottom: "32px",
          }}
        >
          olen<span style={{ color: "#F0956A" }}>.</span>
        </p>

        <p
          style={{
            fontFamily: "var(--font-outfit)",
            fontWeight: 600,
            fontSize: "18px",
            color: "#3D2C20",
            marginBottom: "16px",
          }}
        >
          Your contexts
        </p>

        {activeContexts.length === 0 && !showForm && (
          <p
            style={{
              fontFamily: "var(--font-lexend)",
              fontWeight: 300,
              fontSize: "15px",
              color: "rgba(61,44,32,0.5)",
              marginBottom: "16px",
            }}
          >
            No active contexts yet.
          </p>
        )}

        {activeContexts.map((ctx) => (
          <ContextRow
            key={ctx.id}
            context={ctx}
            nonNegCount={nonNegCount}
            onArchive={handleArchiveRequest}
            onUpdate={(payload) => handleUpdate(ctx.id, payload as Partial<Context>)}
          />
        ))}

        {showWarn && (
          <div
            style={{
              borderRadius: "8px",
              background: "#FDE8D8",
              border: "1.5px solid #F0956A",
              padding: "12px 14px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 300,
                fontSize: "14px",
                color: "#3D2C20",
                margin: 0,
                flex: 1,
              }}
            >
              {SOFT_LIMIT_WARNING}
            </p>
            <button
              onClick={() => setWarnDismissed(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(61,44,32,0.4)",
                fontSize: "18px",
                lineHeight: 1,
                padding: 0,
                flexShrink: 0,
              }}
              aria-label="Dismiss warning"
            >
              ×
            </button>
          </div>
        )}

        {showForm ? (
          <ContextForm
            nonNegCount={nonNegCount}
            onSubmit={handleAddContext}
            onCancel={() => { setShowForm(false); setWarnDismissed(false); }}
          />
        ) : (
          <button
            onClick={() => { setShowForm(true); setWarnDismissed(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "8px",
              border: "1.5px dashed #EDE4D4",
              background: "transparent",
              padding: "12px 14px",
              fontFamily: "var(--font-lexend)",
              fontWeight: 400,
              fontSize: "15px",
              color: "rgba(61,44,32,0.5)",
              cursor: "pointer",
              width: "100%",
              marginTop: "4px",
            }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
            Add context
          </button>
        )}

        {archivedContexts.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <button
              onClick={() => setShowArchived(!showArchived)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-lexend)",
                fontWeight: 400,
                fontSize: "14px",
                color: "rgba(61,44,32,0.5)",
                padding: "0",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  transform: showArchived ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 150ms",
                  display: "inline-block",
                }}
              >
                ›
              </span>
              {showArchived ? "Hide archived" : `Show archived (${archivedContexts.length})`}
            </button>

            {showArchived && (
              <div style={{ marginTop: "12px", opacity: 0.6 }}>
                {archivedContexts.map((ctx) => (
                  <div
                    key={ctx.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #EDE4D4",
                      marginBottom: "8px",
                      background: "#FAF6EE",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontWeight: 400,
                        fontSize: "15px",
                        color: "#3D2C20",
                        textDecoration: "line-through",
                      }}
                    >
                      {ctx.label}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdate(ctx.id, { status: "active" } as Partial<Context>)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#F0956A",
                        fontFamily: "var(--font-lexend)",
                        fontWeight: 400,
                        fontSize: "13px",
                        padding: 0,
                      }}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {archivePendingCtx && archivePending && (
        <>
          <div
            onClick={() => setArchivePending(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 99,
            }}
          />
          <ArchiveSheet
            context={archivePendingCtx}
            incompleteTaskCount={archivePending.incompleteTaskCount}
            otherContexts={otherActiveContexts}
            onMoveAll={handleMoveAll}
            onCompleteAll={handleCompleteAll}
            onClose={() => setArchivePending(null)}
          />
        </>
      )}

      <NavBar />
    </div>
  );
}
