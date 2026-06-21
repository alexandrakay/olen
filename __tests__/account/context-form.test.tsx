import { render, screen, fireEvent } from "@testing-library/react";
import { ContextForm } from "@/components/account/context-form";

test("submit disabled when label empty", () => {
  render(<ContextForm nonNegCount={0} onSubmit={vi.fn()} onCancel={vi.fn()} />);
  expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
});

test("submit enabled when label filled", () => {
  render(<ContextForm nonNegCount={0} onSubmit={vi.fn()} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByPlaceholderText(/context name/i), { target: { value: "Health" } });
  expect(screen.getByRole("button", { name: /add/i })).not.toBeDisabled();
});

test("submit calls onSubmit with trimmed fields", () => {
  const onSubmit = vi.fn();
  render(<ContextForm nonNegCount={0} onSubmit={onSubmit} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByPlaceholderText(/context name/i), { target: { value: "  Health  " } });
  fireEvent.change(screen.getByPlaceholderText(/what does progress/i), { target: { value: "  Work out 3x/week  " } });
  fireEvent.click(screen.getByRole("button", { name: /add/i }));
  expect(onSubmit).toHaveBeenCalledWith({
    label: "Health",
    description: "Work out 3x/week",
    isNonNegotiable: false,
    nonNegotiableDetail: null,
  });
});

test("non-neg toggle appears and can be enabled", () => {
  const onSubmit = vi.fn();
  render(<ContextForm nonNegCount={0} onSubmit={onSubmit} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByPlaceholderText(/context name/i), { target: { value: "Health" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /non-negotiable/i }));
  fireEvent.click(screen.getByRole("button", { name: /add/i }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ isNonNegotiable: true }));
});

test("non-neg toggle disabled when cap reached", () => {
  render(<ContextForm nonNegCount={3} onSubmit={vi.fn()} onCancel={vi.fn()} />);
  expect(screen.getByRole("checkbox", { name: /non-negotiable/i })).toBeDisabled();
});

test("cancel calls onCancel", () => {
  const onCancel = vi.fn();
  render(<ContextForm nonNegCount={0} onSubmit={vi.fn()} onCancel={onCancel} />);
  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
  expect(onCancel).toHaveBeenCalled();
});
