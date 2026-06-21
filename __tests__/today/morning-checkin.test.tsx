import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MorningCheckin } from "@/components/today/morning-checkin";

test("renders all time options", () => {
  render(<MorningCheckin onSubmit={vi.fn()} />);
  expect(screen.getByText("15–30 min")).toBeInTheDocument();
  expect(screen.getByText("30–60 min")).toBeInTheDocument();
  expect(screen.getByText("1–2 hours")).toBeInTheDocument();
  expect(screen.getByText("2+ hours")).toBeInTheDocument();
});

test("renders all energy options", () => {
  render(<MorningCheckin onSubmit={vi.fn()} />);
  expect(screen.getByText("Running on fumes")).toBeInTheDocument();
  expect(screen.getByText("Steady")).toBeInTheDocument();
  expect(screen.getByText("Locked in")).toBeInTheDocument();
});

test("30–60 min and Steady are pre-selected", () => {
  render(<MorningCheckin onSubmit={vi.fn()} />);
  expect(screen.getByText("30–60 min").closest("button")).toHaveAttribute("data-selected", "true");
  expect(screen.getByText("Steady").closest("button")).toHaveAttribute("data-selected", "true");
});

test("updates selected value on tap", async () => {
  const user = userEvent.setup();
  render(<MorningCheckin onSubmit={vi.fn()} />);
  await user.click(screen.getByText("2+ hours"));
  expect(screen.getByText("2+ hours").closest("button")).toHaveAttribute("data-selected", "true");
  expect(screen.getByText("30–60 min").closest("button")).toHaveAttribute("data-selected", "false");
});

test("does not submit after only one tap", () => {
  vi.useFakeTimers();
  const onSubmit = vi.fn();
  render(<MorningCheckin onSubmit={onSubmit} />);
  fireEvent.click(screen.getByText("15–30 min"));
  act(() => vi.advanceTimersByTime(1000));
  expect(onSubmit).not.toHaveBeenCalled();
  vi.useRealTimers();
});

test("submits 350ms after second tap with selected values", () => {
  vi.useFakeTimers();
  const onSubmit = vi.fn();
  render(<MorningCheckin onSubmit={onSubmit} />);
  fireEvent.click(screen.getByText("15–30 min"));
  fireEvent.click(screen.getByText("Locked in"));
  expect(onSubmit).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(349));
  expect(onSubmit).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(onSubmit).toHaveBeenCalledWith({ timeAvailableMins: 20, energyLevel: 5 });
  vi.useRealTimers();
});
