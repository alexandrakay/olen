import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("motion/react", () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) =>
      ({ children, onClick, style, animate, initial, exit, transition, whileTap, "aria-hidden": ah, ...rest }: Record<string, unknown>) =>
        React.createElement(tag, { onClick, style, "aria-hidden": ah, ...rest }, children as React.ReactNode),
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

import { PickReward } from "@/components/today/pick-reward";

const defaultProps = {
  bandColor: "#F0956A",
  cardBg: "#FDE8D8",
  title: "Write the proposal",
  onSubmit: vi.fn(),
  onSkip: vi.fn(),
};

test("renders confirmation text", () => {
  render(<PickReward {...defaultProps} />);
  expect(screen.getByText("That's the one.")).toBeInTheDocument();
});

test("renders the accepted task/context title", () => {
  render(<PickReward {...defaultProps} />);
  expect(screen.getByText("Write the proposal")).toBeInTheDocument();
});

test("time estimate question is not shown immediately", () => {
  vi.useFakeTimers();
  render(<PickReward {...defaultProps} />);
  expect(screen.queryByText(/how long/i)).not.toBeInTheDocument();
  vi.useRealTimers();
});

test("time estimate question appears after 880ms", () => {
  vi.useFakeTimers();
  render(<PickReward {...defaultProps} />);
  act(() => vi.advanceTimersByTime(880));
  expect(screen.getByText(/how long/i)).toBeInTheDocument();
  vi.useRealTimers();
});

test("all four time presets render after delay", () => {
  vi.useFakeTimers();
  render(<PickReward {...defaultProps} />);
  act(() => vi.advanceTimersByTime(880));
  expect(screen.getByText("20 min")).toBeInTheDocument();
  expect(screen.getByText("45 min")).toBeInTheDocument();
  expect(screen.getByText("1–2 hr")).toBeInTheDocument();
  expect(screen.getByText("2 hr+")).toBeInTheDocument();
  vi.useRealTimers();
});

test("clicking a time preset calls onSubmit with correct mins", () => {
  vi.useFakeTimers();
  const onSubmit = vi.fn();
  render(<PickReward {...defaultProps} onSubmit={onSubmit} />);
  act(() => vi.advanceTimersByTime(880));
  fireEvent.click(screen.getByText("45 min"));
  expect(onSubmit).toHaveBeenCalledWith(45);
  vi.useRealTimers();
});

test("skip button calls onSkip", () => {
  vi.useFakeTimers();
  const onSkip = vi.fn();
  render(<PickReward {...defaultProps} onSkip={onSkip} />);
  act(() => vi.advanceTimersByTime(880));
  fireEvent.click(screen.getByText("Skip"));
  expect(onSkip).toHaveBeenCalled();
  vi.useRealTimers();
});

test("renders without crashing when celebrate=false", () => {
  render(<PickReward {...defaultProps} celebrate={false} />);
  expect(screen.getByText("That's the one.")).toBeInTheDocument();
});
