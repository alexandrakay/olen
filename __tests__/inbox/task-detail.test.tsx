import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetail } from "@/components/inbox/task-detail";
import type { Task, Context } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }

const NOW = new Date("2026-06-20T10:00:00");

const context: Context = {
  id: "ctx1", label: "Work", previousLabel: null, description: "", isNonNegotiable: false,
  nonNegotiableDetail: null, priority: 1, status: "active", lastFocusedAt: null, createdAt: ts(NOW),
};

const task: Task = {
  id: "t1", title: "Finish the report", contextId: "ctx1", status: "inbox",
  dueDate: null, energyRequired: "medium", energyOverridden: false,
  energyOverrideAt: null, energyOverrideValue: null, estimatedMins: 45,
  promptVersion: null, snoozedUntil: null, snoozeCount: 0, pickedCount: 0,
  completedAt: null, completedFrom: null, createdAt: ts(NOW),
};

test("renders task title", () => {
  render(<TaskDetail task={task} context={context} contexts={[context]} onClose={vi.fn()} onUpdate={vi.fn()} onComplete={vi.fn()} onArchive={vi.fn()} />);
  expect(screen.getByDisplayValue("Finish the report")).toBeInTheDocument();
});

test("renders mark done button", () => {
  render(<TaskDetail task={task} context={context} contexts={[context]} onClose={vi.fn()} onUpdate={vi.fn()} onComplete={vi.fn()} onArchive={vi.fn()} />);
  expect(screen.getByRole("button", { name: /mark done/i })).toBeInTheDocument();
});

test("renders archive action", () => {
  render(<TaskDetail task={task} context={context} contexts={[context]} onClose={vi.fn()} onUpdate={vi.fn()} onComplete={vi.fn()} onArchive={vi.fn()} />);
  expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument();
});

test("calls onComplete when mark done is tapped", async () => {
  const user = userEvent.setup();
  const onComplete = vi.fn();
  render(<TaskDetail task={task} context={context} contexts={[context]} onClose={vi.fn()} onUpdate={vi.fn()} onComplete={onComplete} onArchive={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: /mark done/i }));
  expect(onComplete).toHaveBeenCalledWith("t1");
});

test("energy override buttons are rendered", () => {
  render(<TaskDetail task={task} context={context} contexts={[context]} onClose={vi.fn()} onUpdate={vi.fn()} onComplete={vi.fn()} onArchive={vi.fn()} />);
  expect(screen.getByText("Low")).toBeInTheDocument();
  expect(screen.getByText("Medium")).toBeInTheDocument();
  expect(screen.getByText("High")).toBeInTheDocument();
});

test("selecting energy calls onUpdate with override fields", async () => {
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  render(<TaskDetail task={task} context={context} contexts={[context]} onClose={vi.fn()} onUpdate={onUpdate} onComplete={vi.fn()} onArchive={vi.fn()} />);
  await user.click(screen.getByText("High"));
  expect(onUpdate).toHaveBeenCalledWith("t1", expect.objectContaining({
    energyOverridden: true,
    energyOverrideValue: "high",
  }));
});
