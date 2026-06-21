import { render, screen, fireEvent } from "@testing-library/react";
import { TaskRow } from "@/components/inbox/task-row";
import type { Task, Context } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(date: Date) {
  return { toDate: () => date } as unknown as Timestamp;
}

const NOW = new Date("2026-06-20T10:00:00");

const context: Context = {
  id: "ctx1", label: "Work", previousLabel: null, description: "",
  isNonNegotiable: false, nonNegotiableDetail: null, priority: 1,
  status: "active", lastFocusedAt: null, createdAt: ts(NOW),
};

const task: Task = {
  id: "t1", title: "Finish the report", contextId: "ctx1", status: "inbox",
  dueDate: null, energyRequired: null, energyOverridden: false,
  energyOverrideAt: null, energyOverrideValue: null, estimatedMins: null,
  promptVersion: null, snoozedUntil: null, snoozeCount: 0, pickedCount: 0,
  completedAt: null, completedFrom: null, createdAt: ts(NOW),
};

function swipeRight(el: HTMLElement, delta = 100) {
  fireEvent.pointerDown(el, { clientX: 0, pointerId: 1 });
  fireEvent.pointerMove(el, { clientX: delta, pointerId: 1 });
  fireEvent.pointerUp(el, { clientX: delta, pointerId: 1 });
}

function swipeLeft(el: HTMLElement, delta = 100) {
  fireEvent.pointerDown(el, { clientX: 0, pointerId: 1 });
  fireEvent.pointerMove(el, { clientX: -delta, pointerId: 1 });
  fireEvent.pointerUp(el, { clientX: -delta, pointerId: 1 });
}

test("renders task title", () => {
  render(<TaskRow task={task} context={context} onComplete={vi.fn()} onSnooze={vi.fn()} onTap={vi.fn()} />);
  expect(screen.getByText("Finish the report")).toBeInTheDocument();
});

test("renders context eyebrow label", () => {
  render(<TaskRow task={task} context={context} onComplete={vi.fn()} onSnooze={vi.fn()} onTap={vi.fn()} />);
  expect(screen.getByText("WORK")).toBeInTheDocument();
});

test("renders due date when set", () => {
  const d = new Date("2026-06-21T12:00:00");
  const taskWithDue = { ...task, dueDate: ts(d) };
  render(<TaskRow task={taskWithDue} context={context} onComplete={vi.fn()} onSnooze={vi.fn()} onTap={vi.fn()} />);
  expect(screen.getByText(/Jun 21/)).toBeInTheDocument();
});

test("swipe right calls onComplete", () => {
  const onComplete = vi.fn();
  render(<TaskRow task={task} context={context} onComplete={onComplete} onSnooze={vi.fn()} onTap={vi.fn()} />);
  swipeRight(screen.getByTestId("task-row"));
  expect(onComplete).toHaveBeenCalledWith("t1");
});

test("swipe left calls onSnooze", () => {
  const onSnooze = vi.fn();
  render(<TaskRow task={task} context={context} onComplete={vi.fn()} onSnooze={onSnooze} onTap={vi.fn()} />);
  swipeLeft(screen.getByTestId("task-row"));
  expect(onSnooze).toHaveBeenCalledWith("t1");
});

test("tap calls onTap", () => {
  const onTap = vi.fn();
  render(<TaskRow task={task} context={context} onComplete={vi.fn()} onSnooze={vi.fn()} onTap={onTap} />);
  fireEvent.click(screen.getByTestId("task-row"));
  expect(onTap).toHaveBeenCalledWith(task);
});

test("snoozed task renders with muted style", () => {
  const snoozed = { ...task, status: "snoozed" as const };
  render(<TaskRow task={snoozed} context={context} onComplete={vi.fn()} onSnooze={vi.fn()} onTap={vi.fn()} />);
  expect(screen.getByTestId("task-row")).toHaveAttribute("data-snoozed", "true");
});
