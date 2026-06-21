import {
  urgencyScore,
  energyScore,
  timeScore,
  neglectScore,
  computeQueue,
} from "@/lib/scoring";
import type { Task, Context, ScoringContext } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

// Minimal Timestamp mock — scoring only needs toDate()
function ts(date: Date) {
  return { toDate: () => date } as unknown as Timestamp;
}

function daysFromNow(n: number, now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  d.setHours(12, 0, 0, 0);
  return ts(d);
}

const NOW = new Date("2026-06-20T10:00:00");

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Test task",
    contextId: "ctx1",
    status: "inbox",
    dueDate: null,
    energyRequired: "medium",
    energyOverridden: false,
    energyOverrideAt: null,
    energyOverrideValue: null,
    estimatedMins: 45,
    promptVersion: null,
    snoozedUntil: null,
    snoozeCount: 0,
    pickedCount: 0,
    completedAt: null,
    completedFrom: null,
    createdAt: ts(NOW),
    ...overrides,
  };
}

function makeContext(overrides: Partial<Context> = {}): Context {
  return {
    id: "ctx1",
    label: "Work",
    previousLabel: null,
    description: "Ship product",
    isNonNegotiable: false,
    nonNegotiableDetail: null,
    priority: 1,
    status: "active",
    lastFocusedAt: null,
    createdAt: ts(NOW),
    ...overrides,
  };
}

const ctx: ScoringContext = {
  now: NOW,
  timeAvailableMins: 45,
  energyLevel: 3,
  dataMaturity: 0,
};

// ─── urgencyScore ─────────────────────────────────────────────────────────────

describe("urgencyScore", () => {
  test("due today → 10.0", () => {
    const task = makeTask({ dueDate: daysFromNow(0, NOW) });
    expect(urgencyScore(task, NOW)).toBe(10.0);
  });

  test("overdue → 10.0 (capped, no stacking)", () => {
    const task = makeTask({ dueDate: daysFromNow(-3, NOW) });
    expect(urgencyScore(task, NOW)).toBe(10.0);
  });

  test("due tomorrow → 2.0", () => {
    const task = makeTask({ dueDate: daysFromNow(1, NOW) });
    expect(urgencyScore(task, NOW)).toBe(2.0);
  });

  test("due in 5 days → 1.5", () => {
    const task = makeTask({ dueDate: daysFromNow(5, NOW) });
    expect(urgencyScore(task, NOW)).toBe(1.5);
  });

  test("due in 8 days → 0.0", () => {
    const task = makeTask({ dueDate: daysFromNow(8, NOW) });
    expect(urgencyScore(task, NOW)).toBe(0.0);
  });

  test("no due date → 0.0", () => {
    const task = makeTask({ dueDate: null });
    expect(urgencyScore(task, NOW)).toBe(0.0);
  });
});

// ─── energyScore ─────────────────────────────────────────────────────────────

describe("energyScore", () => {
  test("exact match → 1.0", () => {
    expect(energyScore(makeTask({ energyRequired: "medium" }), 3)).toBe(1.0);
  });

  test("one level off → 0.6", () => {
    expect(energyScore(makeTask({ energyRequired: "high" }), 3)).toBe(0.6);
  });

  test("two levels off → 0.2", () => {
    expect(energyScore(makeTask({ energyRequired: "high" }), 1)).toBe(0.2);
  });

  test("null energyRequired → 0.4", () => {
    expect(energyScore(makeTask({ energyRequired: null }), 3)).toBe(0.4);
  });

  test("low task + low energy → exact match", () => {
    expect(energyScore(makeTask({ energyRequired: "low" }), 1)).toBe(1.0);
    expect(energyScore(makeTask({ energyRequired: "low" }), 2)).toBe(1.0);
  });

  test("high task + high energy → exact match", () => {
    expect(energyScore(makeTask({ energyRequired: "high" }), 4)).toBe(1.0);
    expect(energyScore(makeTask({ energyRequired: "high" }), 5)).toBe(1.0);
  });
});

// ─── timeScore ────────────────────────────────────────────────────────────────

describe("timeScore", () => {
  test("fits within available → 1.0", () => {
    expect(timeScore(makeTask({ estimatedMins: 20 }), 45)).toBe(1.0);
    expect(timeScore(makeTask({ estimatedMins: 45 }), 45)).toBe(1.0);
  });

  test("50%+ over available → 0.0", () => {
    expect(timeScore(makeTask({ estimatedMins: 120 }), 45)).toBe(0.0);
  });

  test("null estimatedMins + short window (≤45) → 0.3", () => {
    expect(timeScore(makeTask({ estimatedMins: null }), 20)).toBe(0.3);
    expect(timeScore(makeTask({ estimatedMins: null }), 45)).toBe(0.3);
  });

  test("null estimatedMins + long window (≥75) → 0.6", () => {
    expect(timeScore(makeTask({ estimatedMins: null }), 75)).toBe(0.6);
    expect(timeScore(makeTask({ estimatedMins: null }), 120)).toBe(0.6);
  });
});

// ─── neglectScore ─────────────────────────────────────────────────────────────

describe("neglectScore", () => {
  test("lastFocusedAt null → 1.0 (max neglect)", () => {
    expect(neglectScore(makeContext({ lastFocusedAt: null }), NOW)).toBe(1.0);
  });

  test("focused today → 0.0", () => {
    expect(neglectScore(makeContext({ lastFocusedAt: ts(NOW) }), NOW)).toBe(0.0);
  });

  test("7+ days → 1.0", () => {
    const d = new Date(NOW);
    d.setDate(d.getDate() - 7);
    expect(neglectScore(makeContext({ lastFocusedAt: ts(d) }), NOW)).toBe(1.0);
  });

  test("3.5 days → ~0.5", () => {
    const d = new Date(NOW);
    d.setDate(d.getDate() - 3);
    d.setHours(d.getHours() - 12);
    const score = neglectScore(makeContext({ lastFocusedAt: ts(d) }), NOW);
    expect(score).toBeCloseTo(0.5, 1);
  });
});

// ─── computeQueue ─────────────────────────────────────────────────────────────

describe("computeQueue", () => {
  test("returns empty when no eligible tasks", () => {
    const result = computeQueue([], [], ctx);
    expect(result.empty).toBe(true);
    expect(result.queue).toHaveLength(0);
    expect(result.pick).toBeNull();
  });

  test("excludes done, snoozed, someday, archived tasks", () => {
    const tasks = (["done", "snoozed", "someday", "archived"] as const).map(
      (status, i) => makeTask({ id: `t${i}`, status })
    );
    // Recently focused context so it doesn't qualify as a context pick
    const context = makeContext({ lastFocusedAt: ts(NOW) });
    const result = computeQueue(tasks, [context], ctx);
    expect(result.empty).toBe(true);
  });

  test("returns up to 3 candidates", () => {
    const contexts = Array.from({ length: 4 }, (_, i) =>
      makeContext({ id: `ctx${i}`, priority: i + 1 })
    );
    const tasks = contexts.map((c, i) =>
      makeTask({ id: `t${i}`, contextId: c.id })
    );
    const result = computeQueue(tasks, contexts, ctx);
    expect(result.queue.length).toBeLessThanOrEqual(3);
  });

  test("higher urgency wins over lower", () => {
    const context = makeContext();
    const urgent = makeTask({ id: "urgent", dueDate: daysFromNow(0, NOW) });
    const normal = makeTask({ id: "normal", dueDate: null });
    const result = computeQueue([normal, urgent], [context], ctx);
    expect(result.pick?.task?.id).toBe("urgent");
  });

  test("excludes non-negotiable context tasks with no urgency", () => {
    const nonNegCtx = makeContext({ isNonNegotiable: true });
    const task = makeTask({ dueDate: null });
    const result = computeQueue([task], [nonNegCtx], ctx);
    expect(result.empty).toBe(true);
  });

  test("includes non-negotiable context task when it has urgency", () => {
    const nonNegCtx = makeContext({ isNonNegotiable: true });
    const urgentTask = makeTask({ dueDate: daysFromNow(0, NOW) });
    const result = computeQueue([urgentTask], [nonNegCtx], ctx);
    expect(result.empty).toBe(false);
    expect(result.pick?.task?.id).toBe("t1");
  });

  test("cold-start tiebreaker: lower priority context wins when scores equal", () => {
    const ctx1 = makeContext({ id: "ctx1", priority: 2 });
    const ctx2 = makeContext({ id: "ctx2", priority: 1 });
    const task1 = makeTask({ id: "t1", contextId: "ctx1", dueDate: null, energyRequired: "medium", estimatedMins: 45 });
    const task2 = makeTask({ id: "t2", contextId: "ctx2", dueDate: null, energyRequired: "medium", estimatedMins: 45 });
    const result = computeQueue([task1, task2], [ctx1, ctx2], { ...ctx, dataMaturity: 0 });
    expect(result.pick?.task?.id).toBe("t2");
  });
});
