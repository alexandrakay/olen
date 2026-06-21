import { render, screen, fireEvent } from "@testing-library/react";
import { ContextRow } from "@/components/account/context-row";
import type { Context } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

vi.mock("firebase/firestore", () => ({
  Timestamp: { now: () => ({ toDate: () => new Date() }) },
}));

const base: Context = {
  id: "ctx1",
  label: "Work",
  previousLabel: null,
  description: "Client projects",
  isNonNegotiable: false,
  nonNegotiableDetail: null,
  priority: 1,
  status: "active",
  lastFocusedAt: null,
  createdAt: { toDate: () => new Date() } as unknown as ReturnType<typeof Timestamp.now>,
};

test("renders context label", () => {
  render(<ContextRow context={base} nonNegCount={0} onArchive={vi.fn()} onUpdate={vi.fn()} />);
  expect(screen.getByText("Work")).toBeInTheDocument();
});

test("chevron expands to show description and non-neg toggle", () => {
  render(<ContextRow context={base} nonNegCount={0} onArchive={vi.fn()} onUpdate={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /expand Work/i }));
  expect(screen.getByDisplayValue("Client projects")).toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: /non-negotiable/i })).toBeInTheDocument();
});

test("non-neg toggle calls onUpdate with isNonNegotiable true", () => {
  const onUpdate = vi.fn();
  render(<ContextRow context={base} nonNegCount={0} onArchive={vi.fn()} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole("button", { name: /expand Work/i }));
  fireEvent.click(screen.getByRole("checkbox", { name: /non-negotiable/i }));
  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ isNonNegotiable: true }));
});

test("non-neg toggle off calls onUpdate with isNonNegotiable false", () => {
  const onUpdate = vi.fn();
  const ctx = { ...base, isNonNegotiable: true };
  render(<ContextRow context={ctx} nonNegCount={1} onArchive={vi.fn()} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole("button", { name: /expand Work/i }));
  fireEvent.click(screen.getByRole("checkbox", { name: /non-negotiable/i }));
  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ isNonNegotiable: false }));
});

test("non-neg toggle blocked when cap reached and not already non-neg", () => {
  const onUpdate = vi.fn();
  render(<ContextRow context={base} nonNegCount={3} onArchive={vi.fn()} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole("button", { name: /expand Work/i }));
  const checkbox = screen.getByRole("checkbox", { name: /non-negotiable/i });
  expect(checkbox).toBeDisabled();
});

test("archive button calls onArchive", () => {
  const onArchive = vi.fn();
  render(<ContextRow context={base} nonNegCount={0} onArchive={onArchive} onUpdate={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /archive Work/i }));
  expect(onArchive).toHaveBeenCalledWith("ctx1");
});

test("label edit calls onUpdate with new label and previousLabel", () => {
  const onUpdate = vi.fn();
  render(<ContextRow context={base} nonNegCount={0} onArchive={vi.fn()} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole("button", { name: /expand Work/i }));
  const labelInput = screen.getByDisplayValue("Work");
  fireEvent.change(labelInput, { target: { value: "Job" } });
  fireEvent.blur(labelInput);
  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ label: "Job", previousLabel: "Work" }));
});

test("description edit calls onUpdate", () => {
  const onUpdate = vi.fn();
  render(<ContextRow context={base} nonNegCount={0} onArchive={vi.fn()} onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole("button", { name: /expand Work/i }));
  const descInput = screen.getByDisplayValue("Client projects");
  fireEvent.change(descInput, { target: { value: "Freelance work" } });
  fireEvent.blur(descInput);
  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ description: "Freelance work" }));
});
