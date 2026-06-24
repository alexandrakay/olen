import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("motion/react", () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) =>
      ({ children, onClick, style, animate, initial, exit, transition, whileTap, "aria-hidden": ariaHidden, ...rest }: Record<string, unknown>) =>
        React.createElement(tag, { onClick, style, "aria-hidden": ariaHidden, ...rest }, children as React.ReactNode),
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

import { MorningCheckin } from "@/components/today/morning-checkin";

// Energy bars are the 5 unlabelled buttons after the 4 time buttons
function getEnergyBar(index: 0 | 1 | 2 | 3 | 4) {
  return screen.getAllByRole("button")[4 + index];
}

test("renders all four time options", () => {
  render(<MorningCheckin onSubmit={vi.fn()} />);
  expect(screen.getByText("15–30 min")).toBeInTheDocument();
  expect(screen.getByText("30–60 min")).toBeInTheDocument();
  expect(screen.getByText("1–2 hours")).toBeInTheDocument();
  expect(screen.getByText("2+ hours")).toBeInTheDocument();
});

test("shows 'Tap to set your energy' label on mount — nothing pre-selected", () => {
  render(<MorningCheckin onSubmit={vi.fn()} />);
  expect(screen.getByText("Tap to set your energy")).toBeInTheDocument();
});

test("CTA is not visible until both time and energy are chosen", () => {
  render(<MorningCheckin onSubmit={vi.fn()} />);
  expect(screen.queryByText(/see today/i)).not.toBeInTheDocument();
});

test("CTA stays hidden after only time is chosen", async () => {
  const user = userEvent.setup();
  render(<MorningCheckin onSubmit={vi.fn()} />);
  await user.click(screen.getByText("30–60 min"));
  expect(screen.queryByText(/see today/i)).not.toBeInTheDocument();
});

test("CTA appears once both time and energy are chosen", async () => {
  const user = userEvent.setup();
  render(<MorningCheckin onSubmit={vi.fn()} />);
  await user.click(screen.getByText("30–60 min"));
  await user.click(getEnergyBar(2)); // Steady (index 2, value 3)
  expect(screen.getByText(/see today/i)).toBeInTheDocument();
});

test("CTA submits correct timeAvailableMins and energyLevel", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<MorningCheckin onSubmit={onSubmit} />);
  await user.click(screen.getByText("2+ hours"));   // 120 mins
  await user.click(getEnergyBar(4));                 // Locked in (value 5)
  await user.click(screen.getByText(/see today/i));
  expect(onSubmit).toHaveBeenCalledWith({ timeAvailableMins: 120, energyLevel: 5 });
});

test("does not call onSubmit without CTA tap", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<MorningCheckin onSubmit={onSubmit} />);
  await user.click(screen.getByText("15–30 min"));
  await user.click(getEnergyBar(0)); // Running on fumes (value 1)
  expect(onSubmit).not.toHaveBeenCalled();
});

test("energy label updates when a bar is tapped", async () => {
  const user = userEvent.setup();
  render(<MorningCheckin onSubmit={vi.fn()} />);
  await user.click(getEnergyBar(4)); // Locked in
  expect(screen.getByText("Locked in")).toBeInTheDocument();
});

test("isEvening shows 'Good evening.' greeting", () => {
  render(<MorningCheckin onSubmit={vi.fn()} isEvening />);
  expect(screen.getByText("Good evening.")).toBeInTheDocument();
});

test("default (morning) shows 'Good morning.' greeting", () => {
  render(<MorningCheckin onSubmit={vi.fn()} />);
  expect(screen.getByText("Good morning.")).toBeInTheDocument();
});
