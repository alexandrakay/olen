import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenFirstTask } from "@/components/onboarding/screen-first-task";
import type { Context } from "@/lib/types";

const noop = async () => {};

const mockContexts = [
  { id: "ctx-1", label: "Work" },
  { id: "ctx-2", label: "Family" },
] as Context[];

test("renders skip button", () => {
  render(<ScreenFirstTask contexts={mockContexts} onAdvance={noop} onSkip={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
});

test("next button is disabled without a task title", () => {
  render(<ScreenFirstTask contexts={mockContexts} onAdvance={noop} onSkip={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("next button is enabled after entering a title", async () => {
  const user = userEvent.setup();
  render(<ScreenFirstTask contexts={mockContexts} onAdvance={noop} onSkip={noop} onBack={() => {}} advancing={false} />);
  await user.type(screen.getByRole("textbox"), "Finish the report");
  expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
});

test("renders context chips", () => {
  render(<ScreenFirstTask contexts={mockContexts} onAdvance={noop} onSkip={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByText("Work")).toBeInTheDocument();
  expect(screen.getByText("Family")).toBeInTheDocument();
});

test("calls onSkip when skip is clicked", async () => {
  const user = userEvent.setup();
  const onSkip = vi.fn().mockResolvedValue(undefined);
  render(<ScreenFirstTask contexts={mockContexts} onAdvance={noop} onSkip={onSkip} onBack={() => {}} advancing={false} />);
  await user.click(screen.getByRole("button", { name: /skip/i }));
  expect(onSkip).toHaveBeenCalled();
});

test("calls onAdvance with title and selected context", async () => {
  const user = userEvent.setup();
  const onAdvance = vi.fn().mockResolvedValue(undefined);
  render(<ScreenFirstTask contexts={mockContexts} onAdvance={onAdvance} onSkip={noop} onBack={() => {}} advancing={false} />);
  await user.type(screen.getByRole("textbox"), "Finish the report");
  await user.click(screen.getByText("Work"));
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(onAdvance).toHaveBeenCalledWith({ title: "Finish the report", contextId: "ctx-1" });
});
