import { buildPickTextPrompt, validatePickText, fallbackPickText } from "@/lib/pick-text";
import type { ScoredCandidate, Context, Task } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }
const NOW = new Date("2026-06-20T09:00:00");

const context: Context = {
  id: "ctx1", label: "Work", previousLabel: null, description: "Client projects",
  isNonNegotiable: false, nonNegotiableDetail: null, priority: 1, status: "active",
  lastFocusedAt: ts(new Date("2026-06-14T09:00:00")), createdAt: ts(NOW),
};

const task: Task = {
  id: "t1", title: "Send the invoice", contextId: "ctx1", status: "inbox",
  dueDate: null, energyRequired: "low", energyOverridden: false,
  energyOverrideAt: null, energyOverrideValue: null, estimatedMins: 20,
  promptVersion: null, snoozedUntil: null, snoozeCount: 0, pickedCount: 0,
  completedAt: null, completedFrom: null, createdAt: ts(NOW),
};

const taskCandidate: ScoredCandidate = { type: "task", task, context, score: 1.5 };
const ctxCandidate: ScoredCandidate = { type: "context", context, score: 0.55 };

test("buildPickTextPrompt includes task title for task pick", () => {
  const prompt = buildPickTextPrompt(taskCandidate, "Builder.", 3, 45, NOW);
  expect(prompt.userMessage).toContain("Send the invoice");
});

test("buildPickTextPrompt includes context label for context pick", () => {
  const prompt = buildPickTextPrompt(ctxCandidate, "Builder.", 3, 45, NOW);
  expect(prompt.userMessage).toContain("Work");
});

test("buildPickTextPrompt includes days since last focused for context pick", () => {
  const prompt = buildPickTextPrompt(ctxCandidate, "Builder.", 3, 45, NOW);
  expect(prompt.userMessage).toContain("6");
});

test("validatePickText passes for short text", () => {
  expect(validatePickText("Send it now. Just one minute.")).toBe(true);
});

test("validatePickText fails for text over 200 chars", () => {
  expect(validatePickText("a".repeat(201))).toBe(false);
});

test("validatePickText fails for more than 2 sentences", () => {
  expect(validatePickText("One. Two. Three.")).toBe(false);
});

test("fallbackPickText returns static string with task title", () => {
  const text = fallbackPickText(taskCandidate, 3, 45);
  expect(text).toContain("Send the invoice");
});

test("fallbackPickText returns static string with context label for context pick", () => {
  const text = fallbackPickText(ctxCandidate, 3, 45);
  expect(text).toContain("Work");
});
