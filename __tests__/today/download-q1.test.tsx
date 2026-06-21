import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DownloadQ1 } from "@/components/today/download-q1";
import type { Checkin } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }
const NOW = new Date("2026-06-20T18:30:00");

const base: Checkin = {
  date: "2026-06-20", checkinHour: 9, dayOfWeek: 6,
  timeAvailableMins: 45, energyLevel: 3,
  pickedTaskId: "t1", pickedContextId: null, pickPosition: 1,
  pickedSuggestion: "Get it done.", promptVersion: "pick-v1",
  userAccepted: true, createdAt: ts(NOW),
};

test("renders task pick copy", () => {
  render(<DownloadQ1 checkin={base} pickedLabel="Write the proposal" onAnswer={vi.fn()} />);
  expect(screen.getByText(/did you get to/i)).toBeInTheDocument();
  expect(screen.getByText(/Write the proposal/)).toBeInTheDocument();
});

test("renders context pick copy", () => {
  const ctxCheckin = { ...base, pickedTaskId: null, pickedContextId: "ctx1" };
  render(<DownloadQ1 checkin={ctxCheckin} pickedLabel="Work" onAnswer={vi.fn()} />);
  expect(screen.getByText(/did you spend any time on/i)).toBeInTheDocument();
});

test("renders skip copy when no pick", () => {
  const skipCheckin = { ...base, pickedTaskId: null, pickedContextId: null, userAccepted: false };
  render(<DownloadQ1 checkin={skipCheckin} pickedLabel={null} onAnswer={vi.fn()} />);
  expect(screen.getByText(/did you work on anything today/i)).toBeInTheDocument();
});

test("renders all three answer options", () => {
  render(<DownloadQ1 checkin={base} pickedLabel="Write the proposal" onAnswer={vi.fn()} />);
  expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /partial/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /no/i })).toBeInTheDocument();
});

test("calls onAnswer with yes", async () => {
  const user = userEvent.setup();
  const onAnswer = vi.fn();
  render(<DownloadQ1 checkin={base} pickedLabel="Write the proposal" onAnswer={onAnswer} />);
  await user.click(screen.getByRole("button", { name: /^yes$/i }));
  expect(onAnswer).toHaveBeenCalledWith("yes");
});

test("calls onAnswer with partial", async () => {
  const user = userEvent.setup();
  const onAnswer = vi.fn();
  render(<DownloadQ1 checkin={base} pickedLabel="Write the proposal" onAnswer={onAnswer} />);
  await user.click(screen.getByRole("button", { name: /partial/i }));
  expect(onAnswer).toHaveBeenCalledWith("partial");
});

test("calls onAnswer with no", async () => {
  const user = userEvent.setup();
  const onAnswer = vi.fn();
  render(<DownloadQ1 checkin={base} pickedLabel="Write the proposal" onAnswer={onAnswer} />);
  await user.click(screen.getByRole("button", { name: /^no$/i }));
  expect(onAnswer).toHaveBeenCalledWith("no");
});

test("pre-fill shows yes pre-selected with subtext", () => {
  render(
    <DownloadQ1
      checkin={base}
      pickedLabel="Write the proposal"
      onAnswer={vi.fn()}
      prefill={{ preselect: "yes", subtext: "marked done at 12:45" }}
    />
  );
  expect(screen.getByText(/marked done at 12:45/i)).toBeInTheDocument();
});
