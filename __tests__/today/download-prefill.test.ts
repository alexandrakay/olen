import { getDownloadPrefill } from "@/lib/download-prefill";
import type { Checkin, Task } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }
const NOW = new Date("2026-06-20T18:30:00");
const MIDDAY = new Date("2026-06-20T12:45:00");

const baseCheckin: Checkin = {
  date: "2026-06-20", checkinHour: 9, dayOfWeek: 6,
  timeAvailableMins: 45, energyLevel: 3,
  pickedTaskId: "t1", pickedContextId: null, pickPosition: 1,
  pickedSuggestion: "Get it done.", promptVersion: "pick-v1",
  userAccepted: true, createdAt: ts(NOW),
};

const doneTask: Task = {
  id: "t1", title: "Write proposal", contextId: "ctx1", status: "done",
  dueDate: null, energyRequired: "medium", energyOverridden: false,
  energyOverrideAt: null, energyOverrideValue: null, estimatedMins: 45,
  promptVersion: null, snoozedUntil: null, snoozeCount: 0, pickedCount: 0,
  completedAt: ts(MIDDAY), completedFrom: "mid-day",
  createdAt: ts(NOW),
};

const notDoneTask: Task = { ...doneTask, status: "inbox", completedAt: null, completedFrom: null };

test("returns prefill when task done from mid-day", () => {
  const result = getDownloadPrefill(baseCheckin, doneTask);
  expect(result).not.toBeNull();
  expect(result!.preselect).toBe("yes");
  expect(result!.subtext).toMatch(/12:45/);
});

test("returns null when task not done", () => {
  expect(getDownloadPrefill(baseCheckin, notDoneTask)).toBeNull();
});

test("returns null when completedFrom is not mid-day", () => {
  const inboxDone: Task = { ...doneTask, completedFrom: "inbox" };
  expect(getDownloadPrefill(baseCheckin, inboxDone)).toBeNull();
});

test("returns null when no pickedTaskId", () => {
  const ctxCheckin: Checkin = { ...baseCheckin, pickedTaskId: null, pickedContextId: "ctx1" };
  expect(getDownloadPrefill(ctxCheckin, doneTask)).toBeNull();
});

test("returns null when checkin not accepted", () => {
  const skipped: Checkin = { ...baseCheckin, userAccepted: false };
  expect(getDownloadPrefill(skipped, doneTask)).toBeNull();
});
