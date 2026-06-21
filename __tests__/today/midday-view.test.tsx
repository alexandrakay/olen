import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MidDayView } from "@/components/today/midday-view";
import type { Checkin, Task, Context } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  Timestamp: { now: () => ({ toDate: () => new Date() }) },
}));
vi.mock("@/lib/firebase", () => ({ db: {} }));

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }
const NOW = new Date("2026-06-20T11:00:00");

const context: Context = {
  id: "ctx1", label: "Work", previousLabel: null, description: "",
  isNonNegotiable: false, nonNegotiableDetail: null, priority: 1, status: "active",
  lastFocusedAt: ts(NOW), createdAt: ts(NOW),
};

const task: Task = {
  id: "t1", title: "Write the proposal", contextId: "ctx1", status: "inbox",
  dueDate: null, energyRequired: "medium", energyOverridden: false,
  energyOverrideAt: null, energyOverrideValue: null, estimatedMins: 45,
  promptVersion: null, snoozedUntil: null, snoozeCount: 0, pickedCount: 0,
  completedAt: null, completedFrom: null, createdAt: ts(NOW),
};

const checkin: Checkin = {
  date: "2026-06-20",
  checkinHour: 9,
  dayOfWeek: 6,
  timeAvailableMins: 45,
  energyLevel: 3,
  pickedTaskId: "t1",
  pickedContextId: null,
  pickPosition: 1,
  pickedSuggestion: "Good time to get this done.",
  promptVersion: "pick-v1",
  userAccepted: true,
  createdAt: ts(NOW),
};

const defaultProps = {
  checkin,
  pickedTask: task,
  pickedContext: context,
  uid: "user1",
};

test("shows picked task title", () => {
  render(<MidDayView {...defaultProps} />);
  expect(screen.getByText("Write the proposal")).toBeInTheDocument();
});

test("shows Claude pick text (pickedSuggestion)", () => {
  render(<MidDayView {...defaultProps} />);
  expect(screen.getByText("Good time to get this done.")).toBeInTheDocument();
});

test("shows Mark done button", () => {
  render(<MidDayView {...defaultProps} />);
  expect(screen.getByRole("button", { name: /mark done/i })).toBeInTheDocument();
});

test("shows See your inbox link", () => {
  render(<MidDayView {...defaultProps} />);
  expect(screen.getByText(/see your inbox/i)).toBeInTheDocument();
});

test("Mark done calls onDone", async () => {
  const user = userEvent.setup();
  const onDone = vi.fn();
  render(<MidDayView {...defaultProps} onDone={onDone} />);
  await user.click(screen.getByRole("button", { name: /mark done/i }));
  expect(onDone).toHaveBeenCalled();
});

test("skip state shows Take it easy today", () => {
  const skipCheckin: Checkin = { ...checkin, userAccepted: false, pickedTaskId: null };
  render(<MidDayView checkin={skipCheckin} pickedTask={null} pickedContext={context} uid="user1" />);
  expect(screen.getByText(/take it easy today/i)).toBeInTheDocument();
});

test("skip state still shows See your inbox link", () => {
  const skipCheckin: Checkin = { ...checkin, userAccepted: false, pickedTaskId: null };
  render(<MidDayView checkin={skipCheckin} pickedTask={null} pickedContext={context} uid="user1" />);
  expect(screen.getByText(/see your inbox/i)).toBeInTheDocument();
});

test("done state shows single word Done", async () => {
  const user = userEvent.setup();
  render(<MidDayView {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /mark done/i }));
  expect(await screen.findByText(/^done\.?$/i)).toBeInTheDocument();
});
