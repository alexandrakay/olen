import type { Pattern, PatternType } from "@/lib/types";

const DERAILER_LABELS: Record<string, string> = {
  external: "Life getting loud",
  energy: "Ran out of steam",
  unclear: "Not being sure why",
};

// ─── Energy Window ─────────────────────────────────────────────────────────────

interface CheckinLike {
  checkinHour: number;
  date: string;
  userAccepted?: boolean | null;
}

interface DownloadLike {
  date: string;
  energyActual: number;
  completedFocusTask?: string;
  derailerType?: string | null;
  nonNegotiablesProtected?: Record<string, boolean | null>;
}

export function computeEnergyWindowPatterns(
  checkins: CheckinLike[],
  downloads: DownloadLike[],
): Omit<Pattern, "contextId" | "dayOfWeek" | "lastUpdated">[] {
  const downloadMap = new Map(downloads.map((d) => [d.date, d]));

  // Group checkins by hour
  const byHour = new Map<number, number[]>();
  for (const c of checkins) {
    const d = downloadMap.get(c.date);
    if (!d) continue;
    const bucket = byHour.get(c.checkinHour) ?? [];
    bucket.push(d.energyActual);
    byHour.set(c.checkinHour, bucket);
  }

  const patterns: Omit<Pattern, "contextId" | "dayOfWeek" | "lastUpdated">[] = [];

  for (const [hour, energies] of byHour.entries()) {
    if (energies.length < 5) continue;

    const avg = energies.reduce((a, b) => a + b, 0) / energies.length;
    const confidence = Math.min(1.0, Math.max(0.0, energies.length / 20));
    const hourLabel = formatHour(hour);
    const level = avg >= 4 ? "highest" : avg >= 3 ? "moderate" : "lower";

    patterns.push({
      type: "energy-window" as PatternType,
      patternVersion: "energy-window-v1",
      hourRange: [hour, hour + 1],
      insight: `Your energy tends to be ${level} around ${hourLabel}.`,
      confidence,
      sampleSize: energies.length,
    });
  }

  return patterns;
}

// ─── Neglect ──────────────────────────────────────────────────────────────────

interface FocusEvent {
  date: string;
}

export function computeNeglectPattern(
  contextId: string,
  contextLabel: string,
  focusEvents: FocusEvent[],
): Omit<Pattern, "lastUpdated"> | null {
  if (focusEvents.length < 4) return null;

  const sorted = [...focusEvents].sort((a, b) => a.date.localeCompare(b.date));
  let totalDays = 0;
  let intervals = 0;

  for (let i = 1; i < sorted.length; i++) {
    const a = new Date(sorted[i - 1].date);
    const b = new Date(sorted[i].date);
    totalDays += (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
    intervals++;
  }

  const avgDays = Math.round(totalDays / intervals);
  const confidence = Math.min(1.0, Math.max(0.0, focusEvents.length / 20));

  return {
    type: "neglect" as PatternType,
    patternVersion: "neglect-v1",
    contextId,
    dayOfWeek: null,
    hourRange: null,
    insight: `${contextLabel} averages ${avgDays} days between focus sessions.`,
    confidence,
    sampleSize: focusEvents.length,
  };
}

// ─── Derailer ─────────────────────────────────────────────────────────────────

export function computeDerailerPattern(
  downloads: DownloadLike[],
): Omit<Pattern, "contextId" | "dayOfWeek" | "hourRange" | "lastUpdated"> | null {
  const nonCompletions = downloads.filter(
    (d) => d.completedFocusTask === "no" || d.completedFocusTask === "partial"
  );
  if (nonCompletions.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const d of nonCompletions) {
    if (!d.derailerType) continue;
    counts[d.derailerType] = (counts[d.derailerType] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  let dominant: string | null = null;
  let domCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > domCount) { dominant = type; domCount = count; }
  }

  if (!dominant || domCount / total < 0.4) return null;

  const confidence = Math.min(1.0, Math.max(0.0, nonCompletions.length / 20));
  const label = DERAILER_LABELS[dominant] ?? dominant;

  return {
    type: "derailer" as PatternType,
    patternVersion: "derailer-v1",
    insight: `${label} is your most common obstacle.`,
    confidence,
    sampleSize: nonCompletions.length,
  };
}

// ─── Non-negotiable ───────────────────────────────────────────────────────────

export function computeNonNegPattern(
  contextId: string,
  contextLabel: string,
  downloads: DownloadLike[],
): Omit<Pattern, "dayOfWeek" | "hourRange" | "lastUpdated"> | null {
  const relevant = downloads.filter(
    (d) => d.nonNegotiablesProtected && d.nonNegotiablesProtected[contextId] !== undefined
  );
  if (relevant.length < 6) return null;

  const protected_ = relevant.filter((d) => d.nonNegotiablesProtected?.[contextId] === true).length;
  const ratio = protected_ / relevant.length;
  const pct = Math.round(ratio * 100);
  const confidence = Math.min(1.0, Math.max(0.0, relevant.length / 20));

  return {
    type: "non-neg" as PatternType,
    patternVersion: "non-neg-v1",
    contextId,
    insight: `You protect ${contextLabel} about ${pct}% of the time.`,
    confidence,
    sampleSize: relevant.length,
  };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatHour(h: number): string {
  if (h === 0) return "midnight";
  if (h < 12) return `${h}am`;
  if (h === 12) return "noon";
  return `${h - 12}pm`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
