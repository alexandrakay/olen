import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/onboarding/progress-bar";

test("renders 5 step indicators", () => {
  render(<ProgressBar current={1} total={5} />);
  for (let i = 1; i <= 5; i++) {
    expect(screen.getByTestId(`step-${i}`)).toBeInTheDocument();
  }
});

test("marks current step as active", () => {
  render(<ProgressBar current={3} total={5} />);
  expect(screen.getByTestId("step-3")).toHaveAttribute("data-active", "true");
});

test("marks steps before current as complete", () => {
  render(<ProgressBar current={3} total={5} />);
  expect(screen.getByTestId("step-1")).toHaveAttribute("data-complete", "true");
  expect(screen.getByTestId("step-2")).toHaveAttribute("data-complete", "true");
});

test("marks steps after current as neither active nor complete", () => {
  render(<ProgressBar current={3} total={5} />);
  expect(screen.getByTestId("step-4")).toHaveAttribute("data-active", "false");
  expect(screen.getByTestId("step-4")).toHaveAttribute("data-complete", "false");
});
