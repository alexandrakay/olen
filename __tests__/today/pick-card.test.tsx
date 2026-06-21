import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PickCard } from "@/components/today/pick-card";
import type { ScoredCandidate, Context, Task } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }
const NOW = new Date("2026-06-20T09:00:00");

const context: Context = {
  id: "ctx1", label: "Work", previousLabel: null, description: "Deep work on product",
  isNonNegotiable: false, nonNegotiableDetail: null, priority: 1, status: "active",
  lastFocusedAt: ts(NOW), createdAt: ts(NOW),
};

const task: Task = {
  id: "t1", title: "Write the proposal", contextId: "ctx1", status: "inbox",
  dueDate: null, energyRequired: "medium", energyOverridden: false,
  energyOverrideAt: null, energyOverrideValue: null, estimatedMins: 45,
  promptVersion: null, snoozedUntil: null, snoozeCount: 0, pickedCount: 0,
  completedAt: null, completedFrom: null, createdAt: ts(NOW),
};

const taskCandidate: ScoredCandidate = { type: "task", task, context, score: 1.5 };
const contextCandidate: ScoredCandidate = { type: "context", context, score: 0.55 };

test("renders task title for task pick", () => {
  render(<PickCard candidate={taskCandidate} pickText="Time to knock this out." onAccept={vi.fn()} onReject={vi.fn()} />);
  expect(screen.getByText("Write the proposal")).toBeInTheDocument();
});

test("renders context label for context pick", () => {
  render(<PickCard candidate={contextCandidate} pickText="You haven't touched Work in a while." onAccept={vi.fn()} onReject={vi.fn()} />);
  // "Work" appears as eyebrow + title for context picks — both should be present
  expect(screen.getAllByText("Work").length).toBeGreaterThanOrEqual(1);
});

test("renders Claude pick text", () => {
  render(<PickCard candidate={taskCandidate} pickText="Time to knock this out." onAccept={vi.fn()} onReject={vi.fn()} />);
  expect(screen.getByText("Time to knock this out.")).toBeInTheDocument();
});

test("renders estimated time caption when set", () => {
  render(<PickCard candidate={taskCandidate} pickText="Let's go." onAccept={vi.fn()} onReject={vi.fn()} />);
  expect(screen.getByText(/45 min/i)).toBeInTheDocument();
});

test("does not render time caption when estimatedMins is null", () => {
  const noTime: ScoredCandidate = {
    ...taskCandidate,
    task: { ...task, estimatedMins: null },
  };
  render(<PickCard candidate={noTime} pickText="Let's go." onAccept={vi.fn()} onReject={vi.fn()} />);
  expect(screen.queryByText(/min/i)).not.toBeInTheDocument();
});

test("calls onAccept when Let's do it is clicked", async () => {
  const user = userEvent.setup();
  const onAccept = vi.fn();
  render(<PickCard candidate={taskCandidate} pickText="Let's go." onAccept={onAccept} onReject={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: /let's do it/i }));
  expect(onAccept).toHaveBeenCalled();
});

test("calls onReject when Not this one is clicked", async () => {
  const user = userEvent.setup();
  const onReject = vi.fn();
  render(<PickCard candidate={taskCandidate} pickText="Let's go." onAccept={vi.fn()} onReject={onReject} />);
  await user.click(screen.getByRole("button", { name: /not this one/i }));
  expect(onReject).toHaveBeenCalled();
});
