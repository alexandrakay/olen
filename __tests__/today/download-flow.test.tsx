import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  Timestamp: { now: () => ({ toDate: () => new Date() }) },
}));
vi.mock("@/lib/firebase", () => ({ db: {} }));

import { DownloadFlow } from "@/components/today/download-flow";
import type { Checkin, Context } from "@/lib/types";
import type { Timestamp } from "firebase/firestore";

function ts(d = new Date()) { return { toDate: () => d } as unknown as Timestamp; }
const NOW = new Date("2026-06-20T18:30:00");

const context: Context = {
  id: "ctx1", label: "Work", previousLabel: null, description: "",
  isNonNegotiable: false, nonNegotiableDetail: null, priority: 1, status: "active",
  lastFocusedAt: ts(NOW), createdAt: ts(NOW),
};

const checkin: Checkin = {
  date: "2026-06-20", checkinHour: 9, dayOfWeek: 6,
  timeAvailableMins: 45, energyLevel: 3,
  pickedTaskId: "t1", pickedContextId: null, pickPosition: 1,
  pickedSuggestion: "Get it done.", promptVersion: "pick-v1",
  userAccepted: true, createdAt: ts(NOW),
};

const defaultProps = {
  checkin,
  pickedLabel: "Write the proposal",
  contexts: [context],
  uid: "user1",
  onComplete: vi.fn(),
};

test("shows Q1 initially", () => {
  render(<DownloadFlow {...defaultProps} />);
  expect(screen.getByText(/did you get to/i)).toBeInTheDocument();
});

test("Q1 yes → Q2 (no Q3)", async () => {
  const user = userEvent.setup();
  render(<DownloadFlow {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /^yes$/i }));
  expect(await screen.findByText(/how did your energy/i)).toBeInTheDocument();
  expect(screen.queryByText(/what got in the way/i)).not.toBeInTheDocument();
});

test("Q1 no → Q2 then Q3", async () => {
  const user = userEvent.setup();
  render(<DownloadFlow {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /^no$/i }));
  expect(await screen.findByText(/how did your energy/i)).toBeInTheDocument();
  // Answer Q2
  await user.click(screen.getByText("Okay"));
  expect(await screen.findByText(/what got in the way/i)).toBeInTheDocument();
});

test("Q1 partial → Q2 then Q3", async () => {
  const user = userEvent.setup();
  render(<DownloadFlow {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /partial/i }));
  await screen.findByText(/how did your energy/i);
  await user.click(screen.getByText("Okay"));
  expect(await screen.findByText(/what got in the way/i)).toBeInTheDocument();
});

test("closing line yes shows Nice work", async () => {
  const user = userEvent.setup();
  render(<DownloadFlow {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /^yes$/i }));
  await screen.findByText(/how did your energy/i);
  await user.click(screen.getByText("Okay"));
  expect(await screen.findByText(/nice work/i)).toBeInTheDocument();
});

test("closing line no shows Got it", async () => {
  const user = userEvent.setup();
  render(<DownloadFlow {...defaultProps} />);
  await user.click(screen.getByRole("button", { name: /^no$/i }));
  await screen.findByText(/how did your energy/i);
  await user.click(screen.getByText("Okay"));
  await screen.findByText(/what got in the way/i);
  await user.click(screen.getByText(/life got loud/i));
  expect(await screen.findByText(/got it/i)).toBeInTheDocument();
});
