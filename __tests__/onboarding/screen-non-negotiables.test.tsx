import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenNonNegotiables } from "@/components/onboarding/screen-non-negotiables";
import type { Context } from "@/lib/types";

const noop = async () => {};

const mockContexts = [
  { id: "ctx-1", label: "Work", description: "Ship product" },
  { id: "ctx-2", label: "Family", description: "Be present" },
] as Context[];

test("renders skip button", () => {
  render(<ScreenNonNegotiables contexts={mockContexts} onAdvance={noop} onSkip={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
});

test("calls onSkip when skip is clicked", async () => {
  const user = userEvent.setup();
  const onSkip = vi.fn().mockResolvedValue(undefined);
  render(<ScreenNonNegotiables contexts={mockContexts} onAdvance={onSkip} onSkip={onSkip} onBack={() => {}} advancing={false} />);
  await user.click(screen.getByRole("button", { name: /skip/i }));
  expect(onSkip).toHaveBeenCalled();
});

test("renders each context as a selectable option", () => {
  render(<ScreenNonNegotiables contexts={mockContexts} onAdvance={noop} onSkip={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByText("Work")).toBeInTheDocument();
  expect(screen.getByText("Family")).toBeInTheDocument();
});

test("timing note input appears after selecting a context", async () => {
  const user = userEvent.setup();
  render(<ScreenNonNegotiables contexts={mockContexts} onAdvance={noop} onSkip={noop} onBack={() => {}} advancing={false} />);
  await user.click(screen.getByText("Work"));
  expect(screen.getByPlaceholderText(/timing/i)).toBeInTheDocument();
});

test("calls onAdvance with selected context ids", async () => {
  const user = userEvent.setup();
  const onAdvance = vi.fn().mockResolvedValue(undefined);
  render(<ScreenNonNegotiables contexts={mockContexts} onAdvance={onAdvance} onSkip={noop} onBack={() => {}} advancing={false} />);
  await user.click(screen.getByText("Work"));
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(onAdvance).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ contextId: "ctx-1" })])
  );
});
