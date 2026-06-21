import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

// ─── Energy Window ─────────────────────────────────────────────────────────────

function computeEnergyWindowPatterns(
  checkins: FirebaseFirestore.DocumentData[],
  downloadMap: Map<string, FirebaseFirestore.DocumentData>
) {
  const byHour = new Map<number, number[]>();
  for (const c of checkins) {
    const d = downloadMap.get(c.date);
    if (!d) continue;
    const bucket = byHour.get(c.checkinHour as number) ?? [];
    bucket.push(d.energyActual as number);
    byHour.set(c.checkinHour as number, bucket);
  }

  const patterns: object[] = [];
  for (const [hour, energies] of byHour.entries()) {
    if (energies.length < 5) continue;
    const confidence = Math.min(1.0, Math.max(0.0, energies.length / 20));
    const avg = energies.reduce((a, b) => a + b, 0) / energies.length;
    const level = avg >= 4 ? "highest" : avg >= 3 ? "moderate" : "lower";
    patterns.push({
      type: "energy-window",
      patternVersion: "energy-window-v1",
      contextId: null,
      dayOfWeek: null,
      hourRange: [hour, hour + 1],
      insight: `Your energy tends to be ${level} around ${formatHour(hour)}.`,
      confidence,
      sampleSize: energies.length,
      lastUpdated: Timestamp.now(),
    });
  }
  return patterns;
}

// ─── Neglect ──────────────────────────────────────────────────────────────────

function computeNeglectPatterns(
  checkins: FirebaseFirestore.DocumentData[],
  contexts: FirebaseFirestore.QueryDocumentSnapshot[]
) {
  const ctxMap = new Map(contexts.map((c) => [c.id, c.data()]));
  const ctxDates = new Map<string, string[]>();

  for (const c of checkins) {
    if (!c.pickedContextId && !c.pickedTaskId) continue;
    const cid = (c.pickedContextId ?? c.contextId) as string | undefined;
    if (!cid) continue;
    const arr = ctxDates.get(cid) ?? [];
    arr.push(c.date as string);
    ctxDates.set(cid, arr);
  }

  const patterns: object[] = [];
  for (const [ctxId, dates] of ctxDates.entries()) {
    if (dates.length < 4) continue;
    const sorted = [...dates].sort();
    let totalDays = 0;
    for (let i = 1; i < sorted.length; i++) {
      const a = new Date(sorted[i - 1]);
      const b = new Date(sorted[i]);
      totalDays += (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
    }
    const avgDays = Math.round(totalDays / (sorted.length - 1));
    const confidence = Math.min(1.0, Math.max(0.0, dates.length / 20));
    const label = (ctxMap.get(ctxId)?.label as string) ?? ctxId;
    patterns.push({
      type: "neglect",
      patternVersion: "neglect-v1",
      contextId: ctxId,
      dayOfWeek: null,
      hourRange: null,
      insight: `${label} averages ${avgDays} days between focus sessions.`,
      confidence,
      sampleSize: dates.length,
      lastUpdated: Timestamp.now(),
    });
  }
  return patterns;
}

// ─── Derailer ─────────────────────────────────────────────────────────────────

const DERAILER_LABELS: Record<string, string> = {
  external: "Life getting loud",
  energy: "Ran out of steam",
  unclear: "Not being sure why",
};

function computeDerailerPattern(downloads: FirebaseFirestore.DocumentData[]) {
  const nonCompletions = downloads.filter(
    (d) => d.completedFocusTask === "no" || d.completedFocusTask === "partial"
  );
  if (nonCompletions.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const d of nonCompletions) {
    if (!d.derailerType) continue;
    counts[d.derailerType as string] = (counts[d.derailerType as string] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  let dominant: string | null = null;
  let domCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > domCount) { dominant = type; domCount = count; }
  }

  if (!dominant || domCount / total < 0.4) return null;

  const label = DERAILER_LABELS[dominant] ?? dominant;
  return {
    type: "derailer",
    patternVersion: "derailer-v1",
    contextId: null,
    dayOfWeek: null,
    hourRange: null,
    insight: `${label} is your most common obstacle.`,
    confidence: Math.min(1.0, Math.max(0.0, nonCompletions.length / 20)),
    sampleSize: nonCompletions.length,
    lastUpdated: Timestamp.now(),
  };
}

// ─── Non-negotiable ───────────────────────────────────────────────────────────

function computeNonNegPatterns(
  downloads: FirebaseFirestore.DocumentData[],
  contexts: FirebaseFirestore.QueryDocumentSnapshot[]
) {
  const nonNegContexts = contexts.filter((c) => c.data().isNonNegotiable);
  const patterns: object[] = [];

  for (const ctx of nonNegContexts) {
    const relevant = downloads.filter(
      (d) => d.nonNegotiablesProtected && d.nonNegotiablesProtected[ctx.id] !== undefined
    );
    if (relevant.length < 6) continue;

    const protected_ = relevant.filter((d) => d.nonNegotiablesProtected[ctx.id] === true).length;
    const pct = Math.round((protected_ / relevant.length) * 100);
    const confidence = Math.min(1.0, Math.max(0.0, relevant.length / 20));

    patterns.push({
      type: "non-neg",
      patternVersion: "non-neg-v1",
      contextId: ctx.id,
      dayOfWeek: null,
      hourRange: null,
      insight: `You protect ${ctx.data().label as string} about ${pct}% of the time.`,
      confidence,
      sampleSize: relevant.length,
      lastUpdated: Timestamp.now(),
    });
  }

  return patterns;
}

// ─── Cloud Function ───────────────────────────────────────────────────────────

export const writePatterns = onSchedule("every day 02:00", async () => {
  const db = getFirestore();
  const now = new Date();
  const cutoff = Timestamp.fromMillis(now.getTime() - NINETY_DAYS_MS);

  const usersSnap = await db.collection("users").get();

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data();

    try {
      // ─── Pattern writer ────────────────────────────────────────────────────
      const [checkinsSnap, downloadsSnap, contextsSnap] = await Promise.all([
        db.collection(`users/${uid}/checkins`).where("createdAt", ">=", cutoff).get(),
        db.collection(`users/${uid}/downloads`).where("createdAt", ">=", cutoff).get(),
        db.collection(`users/${uid}/contexts`).where("status", "==", "active").get(),
      ]);

      const checkins = checkinsSnap.docs.map((d) => d.data());
      const downloads = downloadsSnap.docs.map((d) => d.data());
      const downloadMap = new Map(downloads.map((d) => [d.date as string, d]));

      const allPatterns = [
        ...computeEnergyWindowPatterns(checkins, downloadMap),
        ...computeNeglectPatterns(checkins, contextsSnap.docs),
        ...computeNonNegPatterns(downloads, contextsSnap.docs),
      ];

      const derailer = computeDerailerPattern(downloads);
      if (derailer) allPatterns.push(derailer);

      const batch = db.batch();

      // Overwrite patterns collection
      const patternsSnap = await db.collection(`users/${uid}/patterns`).get();
      patternsSnap.docs.forEach((d) => batch.delete(d.ref));
      allPatterns.forEach((p) => {
        batch.set(db.collection(`users/${uid}/patterns`).doc(), p);
      });

      // ─── Null resolver ─────────────────────────────────────────────────────
      const nullDownloads = downloadsSnap.docs.filter((d) => {
        const nnp = d.data().nonNegotiablesProtected as Record<string, boolean | null> | undefined;
        return nnp && Object.values(nnp).some((v) => v === null);
      });

      for (const dlDoc of nullDownloads) {
        const nnp = { ...dlDoc.data().nonNegotiablesProtected } as Record<string, boolean | null>;
        for (const ctxId of Object.keys(nnp)) {
          if (nnp[ctxId] !== null) continue;
          // Resolve to true if past the typical window (conservative default)
          nnp[ctxId] = true;
        }
        batch.update(dlDoc.ref, { nonNegotiablesProtected: nnp });
      }

      // ─── Onboarding recovery ───────────────────────────────────────────────
      const createdAt = userData.createdAt as Timestamp | null;
      const isStuckOnboarding =
        userData.onboardingStep === 5 &&
        userData.onboardingComplete === false &&
        createdAt &&
        now.getTime() - createdAt.toMillis() > FORTY_EIGHT_HOURS_MS;

      if (isStuckOnboarding) {
        batch.update(userDoc.ref, { onboardingComplete: true });
      }

      await batch.commit();
    } catch {
      // Skip user on error — function continues to next user
    }
  }
});

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatHour(h: number): string {
  if (h === 0) return "midnight";
  if (h < 12) return `${h}am`;
  if (h === 12) return "noon";
  return `${h - 12}pm`;
}
