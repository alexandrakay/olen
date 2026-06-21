import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SomedaySection } from "@/components/inbox/someday-section";
import type { Task, Context } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }
const NOW = new Date("2026-06-20T10:00:00");

const context: Context = {
  id: "ctx1", label: "Work", previousLabel: null, description: "", isNonNegotiable: false,
  nonNegotiableDetail: null, priority: 1, status: "active", lastFocusedAt: null, createdAt: ts(NOW),
};

function makeTask(id: string, title: string): Task {
  return {
    id, title, contextId: "ctx1", status: "someday",
    dueDate: null, energyRequired: null, energyOverridden: false,
    energyOverrideAt: null, energyOverrideValue: null, estimatedMins: null,
    promptVersion: null, snoozedUntil: null, snoozeCount: 0, pickedCount: 0,
    completedAt: null, completedFrom: null, createdAt: ts(NOW),
  };
}

const tasks = [makeTask("s1", "Learn guitar"), makeTask("s2", "Write a blog post")];

test("is collapsed by default — tasks not visible", () => {
  render(<SomedaySection tasks={tasks} contexts={[context]} onMoveToActive={vi.fn()} />);
  expect(screen.queryByText("Learn guitar")).not.toBeInTheDocument();
});

test("shows task count in collapsed header", () => {
  render(<SomedaySection tasks={tasks} contexts={[context]} onMoveToActive={vi.fn()} />);
  expect(screen.getByText(/someday/i)).toBeInTheDocument();
  expect(screen.getByText(/2/)).toBeInTheDocument();
});

test("expands on click to show tasks", async () => {
  const user = userEvent.setup();
  render(<SomedaySection tasks={tasks} contexts={[context]} onMoveToActive={vi.fn()} />);
  await user.click(screen.getByText(/someday/i));
  expect(screen.getByText("Learn guitar")).toBeInTheDocument();
  expect(screen.getByText("Write a blog post")).toBeInTheDocument();
});

test("move to active calls onMoveToActive with task id", async () => {
  const user = userEvent.setup();
  const onMoveToActive = vi.fn();
  render(<SomedaySection tasks={tasks} contexts={[context]} onMoveToActive={onMoveToActive} />);
  await user.click(screen.getByText(/someday/i));
  const buttons = screen.getAllByRole("button", { name: /move to active/i });
  await user.click(buttons[0]);
  expect(onMoveToActive).toHaveBeenCalledWith("s1");
});
