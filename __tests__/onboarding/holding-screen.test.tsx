import { render, screen } from "@testing-library/react";
import { HoldingScreen } from "@/components/onboarding/holding-screen";

const noop = async () => {};

test("renders holding copy", () => {
  render(<HoldingScreen onNotificationResponse={noop} />);
  expect(screen.getByText(/you're all set/i)).toBeInTheDocument();
  expect(screen.getByText(/tomorrow morning/i)).toBeInTheDocument();
});

test("renders inbox link", () => {
  render(<HoldingScreen onNotificationResponse={noop} />);
  expect(screen.getByRole("link", { name: /see your task inbox/i })).toBeInTheDocument();
});

test("inbox link points to inbox route", () => {
  render(<HoldingScreen onNotificationResponse={noop} />);
  expect(screen.getByRole("link", { name: /see your task inbox/i })).toHaveAttribute("href", "/inbox");
});

test("renders notification permission button", () => {
  render(<HoldingScreen onNotificationResponse={noop} />);
  expect(screen.getByRole("button", { name: /turn on notifications/i })).toBeInTheDocument();
});
