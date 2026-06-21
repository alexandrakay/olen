import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnoozeSheet } from "@/components/inbox/snooze-sheet";

test("renders vague copy — no literal count", () => {
  render(<SnoozeSheet onSnoozeAgain={vi.fn()} onMoveSomeday={vi.fn()} onRemove={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByText(/snoozed this a few times/i)).toBeInTheDocument();
  expect(screen.queryByText(/3/)).not.toBeInTheDocument();
});

test("renders all three action buttons", () => {
  render(<SnoozeSheet onSnoozeAgain={vi.fn()} onMoveSomeday={vi.fn()} onRemove={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByRole("button", { name: /snooze again/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /someday/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
});

test("snooze again calls onSnoozeAgain", async () => {
  const user = userEvent.setup();
  const onSnoozeAgain = vi.fn();
  render(<SnoozeSheet onSnoozeAgain={onSnoozeAgain} onMoveSomeday={vi.fn()} onRemove={vi.fn()} onClose={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: /snooze again/i }));
  expect(onSnoozeAgain).toHaveBeenCalled();
});

test("move to someday calls onMoveSomeday", async () => {
  const user = userEvent.setup();
  const onMoveSomeday = vi.fn();
  render(<SnoozeSheet onSnoozeAgain={vi.fn()} onMoveSomeday={onMoveSomeday} onRemove={vi.fn()} onClose={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: /someday/i }));
  expect(onMoveSomeday).toHaveBeenCalled();
});

test("remove calls onRemove", async () => {
  const user = userEvent.setup();
  const onRemove = vi.fn();
  render(<SnoozeSheet onSnoozeAgain={vi.fn()} onMoveSomeday={vi.fn()} onRemove={onRemove} onClose={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: /remove/i }));
  expect(onRemove).toHaveBeenCalled();
});
