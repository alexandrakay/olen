import type { Task, Context, ScoringContext, ScoredCandidate, ScoringResult } from "@/lib/types";

type EnergyBucket = "low" | "medium" | "high";

function energyBucket(level: 1 | 2 | 3 | 4 | 5): EnergyBucket {
  if (level <= 2) return "low";
  if (level === 3) return "medium";
  return "high";
}

const ENERGY_LEVELS: EnergyBucket[] = ["low", "medium", "high"];

function energyDiff(a: EnergyBucket, b: EnergyBucket): number {
  return Math.abs(ENERGY_LEVELS.indexOf(a) - ENERGY_LEVELS.indexOf(b));
}

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function urgencyScore(task: Task, now: Date): number {
  if (!task.dueDate) return 0.0;

  const due = startOfDay(task.dueDate.toDate());
  const today = startOfDay(now);
  const daysUntil = Math.round(daysBetween(today, due));

  if (daysUntil <= 0) return 10.0; // today or overdue — capped at 10.0
  if (daysUntil === 1) return 2.0;
  if (daysUntil <= 7) return 1.5; // rolling 7 days
  return 0.0;
}

export function energyScore(task: Task, energyLevel: 1 | 2 | 3 | 4 | 5): number {
  if (task.energyRequired === null) return 0.4;

  const diff = energyDiff(task.energyRequired, energyBucket(energyLevel));
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.6;
  return 0.2;
}

export function timeScore(task: Task, timeAvailableMins: 20 | 45 | 75 | 120): number {
  if (task.estimatedMins === null) {
    return timeAvailableMins <= 45 ? 0.3 : 0.6;
  }

  if (task.estimatedMins <= timeAvailableMins) return 1.0;
  if (task.estimatedMins > timeAvailableMins * 1.5) return 0.0;

  // Linear between fits (1.0) and 50% over (0.0)
  const overage = task.estimatedMins - timeAvailableMins;
  return Math.max(0, 1.0 - overage / (timeAvailableMins * 0.5));
}

export function neglectScore(context: Context, now: Date): number {
  if (!context.lastFocusedAt) return 1.0;
  const days = daysBetween(context.lastFocusedAt.toDate(), now);
  return Math.min(1.0, Math.max(0.0, days / 7));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function scoreTask(task: Task, context: Context, ctx: ScoringContext): number {
  return (
    urgencyScore(task, ctx.now) +
    energyScore(task, ctx.energyLevel) * 0.75 +
    timeScore(task, ctx.timeAvailableMins) * 0.65 +
    neglectScore(context, ctx.now) * 0.55 +
    0 * lerp(0, 0.8, ctx.dataMaturity) + // todScore placeholder
    0 * lerp(0, 0.6, ctx.dataMaturity)   // dowScore placeholder
  );
}

export function computeQueue(
  tasks: Task[],
  contexts: Context[],
  ctx: ScoringContext,
): ScoringResult {
  const contextMap = new Map(contexts.map((c) => [c.id, c]));
  const candidates: ScoredCandidate[] = [];

  for (const task of tasks) {
    if (task.status !== "inbox" && task.status !== "active") continue;

    const context = contextMap.get(task.contextId);
    if (!context || context.status === "archived") continue;

    // Non-negotiable contexts: exclude unless task has urgency
    if (context.isNonNegotiable && urgencyScore(task, ctx.now) === 0) continue;

    candidates.push({
      type: "task",
      task,
      context,
      score: scoreTask(task, context, ctx),
    });
  }

  // Context picks: surface when a non-archived, non-neg context has no active tasks
  for (const context of contexts) {
    if (context.status === "archived" || context.isNonNegotiable) continue;
    const hasActiveTasks = tasks.some(
      (t) =>
        t.contextId === context.id &&
        (t.status === "inbox" || t.status === "active")
    );
    if (!hasActiveTasks) {
      const ns = neglectScore(context, ctx.now);
      if (ns >= 0.5) {
        candidates.push({
          type: "context",
          context,
          score: ns * 0.55,
        });
      }
    }
  }

  if (candidates.length === 0) {
    return { empty: true, queue: [], pick: null, dataMaturity: ctx.dataMaturity };
  }

  candidates.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.001) return b.score - a.score;
    // Cold-start tiebreaker: lower context priority number wins, fades with dataMaturity
    const aPri = a.context.priority ?? 999;
    const bPri = b.context.priority ?? 999;
    return (aPri - bPri) * (1 - ctx.dataMaturity);
  });

  const queue = candidates.slice(0, 3);
  return { empty: false, queue, pick: queue[0], dataMaturity: ctx.dataMaturity };
}
