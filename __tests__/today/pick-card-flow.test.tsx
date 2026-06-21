import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/app/actions/generate-pick-text", () => ({
  generatePickText: vi.fn().mockResolvedValue({ text: "Test pick text.", promptVersion: "pick-v1" }),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  Timestamp: { now: () => ({ toDate: () => new Date() }) },
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

import { PickCardFlow } from "@/components/today/pick-card-flow";
import type { ScoringResult, ScoredCandidate, Context, Task } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d, toMillis: () => d.getTime() } as unknown as Timestamp; }
const NOW = new Date("2026-06-20T09:00:00");

function makeCtx(id: string, label: string): Context {
  return {
    id, label, previousLabel: null, description: "", isNonNegotiable: false,
    nonNegotiableDetail: null, priority: 1, status: "active",
    lastFocusedAt: ts(NOW), createdAt: ts(NOW),
  };
}

function makeTask(id: string, title: string, ctxId: string): Task {
  return {
    id, title, contextId: ctxId, status: "inbox",
    dueDate: null, energyRequired: "medium", energyOverridden: false,
    energyOverrideAt: null, energyOverrideValue: null, estimatedMins: null,
    promptVersion: null, snoozedUntil: null, snoozeCount: 0, pickedCount: 0,
    completedAt: null, completedFrom: null, createdAt: ts(NOW),
  };
}

const ctx1 = makeCtx("c1", "Work");
const ctx2 = makeCtx("c2", "Health");
const ctx3 = makeCtx("c3", "Personal");

const candidates: ScoredCandidate[] = [
  { type: "task", task: makeTask("t1", "Write proposal", "c1"), context: ctx1, score: 2 },
  { type: "task", task: makeTask("t2", "Go for a run", "c2"), context: ctx2, score: 1.5 },
  { type: "task", task: makeTask("t3", "Call mom", "c3"), context: ctx3, score: 1 },
];

const result: ScoringResult = {
  empty: false,
  queue: candidates,
  pick: candidates[0],
  dataMaturity: 0,
};

const defaultProps = {
  scoringResult: result,
  checkinDate: "2026-06-20",
  uid: "user1",
  bio: "Builder working on too many things.",
  energyLevel: 3 as const,
  timeAvailableMins: 45 as const,
  onAccepted: vi.fn(),
  onSkip: vi.fn(),
};

test("shows first candidate initially", () => {
  render(<PickCardFlow {...defaultProps} />);
  expect(screen.getByText("Write proposal")).toBeInTheDocument();
});

test("shows second candidate after first rejection", async () => {
  const user = userEvent.setup();
  render(<PickCardFlow {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /not this one/i }));
  expect(await screen.findByText("Go for a run")).toBeInTheDocument();
});

test("shows third candidate after two rejections", async () => {
  const user = userEvent.setup();
  render(<PickCardFlow {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /not this one/i }));
  await screen.findByText("Go for a run");
  await user.click(screen.getByRole("button", { name: /not this one/i }));
  expect(await screen.findByText("Call mom")).toBeInTheDocument();
});

test("shows third-rejection UI after three rejections", async () => {
  const user = userEvent.setup();
  render(<PickCardFlow {...defaultProps} />);
  for (let i = 0; i < 3; i++) {
    await user.click(screen.getByRole("button", { name: /not this one/i }));
  }
  expect(await screen.findByText(/nothing.s clicking/i)).toBeInTheDocument();
});

test("Call it triggers onSkip", async () => {
  const onSkip = vi.fn();
  const user = userEvent.setup();
  render(<PickCardFlow {...defaultProps} onSkip={onSkip} />);
  for (let i = 0; i < 3; i++) {
    await user.click(screen.getByRole("button", { name: /not this one/i }));
  }
  await user.click(await screen.findByRole("button", { name: /call it/i }));
  expect(onSkip).toHaveBeenCalled();
});

test("shows post-acceptance prompt after Let's do it", async () => {
  const user = userEvent.setup();
  render(<PickCardFlow {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /let's do it/i }));
  expect(await screen.findByText(/how long/i)).toBeInTheDocument();
});
