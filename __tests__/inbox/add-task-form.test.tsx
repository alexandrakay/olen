import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTaskForm } from "@/components/inbox/add-task-form";
import type { Context } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }

const contexts: Context[] = [
  { id: "ctx1", label: "Work", previousLabel: null, description: "", isNonNegotiable: false, nonNegotiableDetail: null, priority: 1, status: "active", lastFocusedAt: null, createdAt: ts() },
  { id: "ctx2", label: "Family", previousLabel: null, description: "", isNonNegotiable: false, nonNegotiableDetail: null, priority: 2, status: "active", lastFocusedAt: null, createdAt: ts() },
];

test("renders add task input", () => {
  render(<AddTaskForm contexts={contexts} onAdd={vi.fn()} />);
  expect(screen.getByPlaceholderText(/add a task/i)).toBeInTheDocument();
});

test("empty title submit does nothing", async () => {
  const onAdd = vi.fn();
  render(<AddTaskForm contexts={contexts} onAdd={onAdd} />);
  fireEvent.click(screen.getByPlaceholderText(/add a task/i));
  fireEvent.keyDown(screen.getByPlaceholderText(/add a task/i), { key: "Enter" });
  expect(onAdd).not.toHaveBeenCalled();
});

test("renders context chips when expanded", async () => {
  const user = userEvent.setup();
  render(<AddTaskForm contexts={contexts} onAdd={vi.fn()} />);
  await user.click(screen.getByPlaceholderText(/add a task/i));
  expect(screen.getByText("Work")).toBeInTheDocument();
  expect(screen.getByText("Family")).toBeInTheDocument();
});

test("calls onAdd with title and contextId on Enter", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  render(<AddTaskForm contexts={contexts} onAdd={onAdd} />);
  await user.type(screen.getByPlaceholderText(/add a task/i), "Buy groceries");
  await user.keyboard("{Enter}");
  expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
    title: "Buy groceries",
    contextId: "ctx1",
  }));
});

test("first context pre-selected by default", async () => {
  const user = userEvent.setup();
  render(<AddTaskForm contexts={contexts} onAdd={vi.fn()} />);
  await user.click(screen.getByPlaceholderText(/add a task/i));
  expect(screen.getByText("Work").closest("button")).toHaveAttribute("data-selected", "true");
});
