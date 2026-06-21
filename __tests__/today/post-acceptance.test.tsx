import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostAcceptance } from "@/components/today/post-acceptance";

test("renders time presets", () => {
  render(<PostAcceptance onSubmit={vi.fn()} onSkip={vi.fn()} />);
  expect(screen.getByText("20 min")).toBeInTheDocument();
  expect(screen.getByText("45 min")).toBeInTheDocument();
  expect(screen.getByText("1–2 hr")).toBeInTheDocument();
  expect(screen.getByText("2 hr+")).toBeInTheDocument();
});

test("calls onSubmit with selected mins", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<PostAcceptance onSubmit={onSubmit} onSkip={vi.fn()} />);
  await user.click(screen.getByText("45 min"));
  expect(onSubmit).toHaveBeenCalledWith(45);
});

test("calls onSkip when skipped", async () => {
  const user = userEvent.setup();
  const onSkip = vi.fn();
  render(<PostAcceptance onSubmit={vi.fn()} onSkip={onSkip} />);
  await user.click(screen.getByRole("button", { name: /skip/i }));
  expect(onSkip).toHaveBeenCalled();
});
