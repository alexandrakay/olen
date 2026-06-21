import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenTypicalWeek } from "@/components/onboarding/screen-typical-week";

const noop = async () => {};

test("renders morning window options", () => {
  render(<ScreenTypicalWeek onAdvance={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByText(/before 9am/i)).toBeInTheDocument();
  expect(screen.getByText(/9.11am/i)).toBeInTheDocument();
  expect(screen.getByText(/after 11am/i)).toBeInTheDocument();
  expect(screen.getByText(/varies/i)).toBeInTheDocument();
});

test("renders all 7 days for chaotic days", () => {
  render(<ScreenTypicalWeek onAdvance={noop} onBack={() => {}} advancing={false} />);
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
    expect(screen.getByText(day)).toBeInTheDocument();
  });
});

test("renders energy peak options", () => {
  render(<ScreenTypicalWeek onAdvance={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByText(/morning/i)).toBeInTheDocument();
  expect(screen.getByText(/midday/i)).toBeInTheDocument();
  expect(screen.getByText(/evening/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /unpredictable/i })).toBeInTheDocument();
});

test("calls onAdvance with correct schedule priors", async () => {
  const user = userEvent.setup();
  const onAdvance = vi.fn().mockResolvedValue(undefined);
  render(<ScreenTypicalWeek onAdvance={onAdvance} onBack={() => {}} advancing={false} />);
  await user.click(screen.getByText(/before 9am/i));
  await user.click(screen.getByText(/morning/i));
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(onAdvance).toHaveBeenCalledWith(
    expect.objectContaining({ morningWindow: "before-9am", energyPeak: "morning" })
  );
});
