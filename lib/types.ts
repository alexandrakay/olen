import type { Timestamp } from "firebase/firestore";

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string;
  displayName: string;
  bio: string; // Prepended to all Claude prompts
  createdAt: Timestamp;
  onboardingCompletedAt: Timestamp | null;
  trialEndsAt: Timestamp; // createdAt + 14 days
  onboardingStep: number; // 1–5. Increments only, never decrements.
  onboardingComplete: boolean;
  subscriptionStatus: "trial" | "active" | "cancelled" | "expired" | "past_due";
  stripeCustomerId: string | null;
  timezone: string; // IANA tz string e.g. "America/New_York"
  schedulePriors: SchedulePriors;
  notificationsEnabled: boolean;
  notificationTime: string; // HH:MM e.g. "07:30"
  energyBaseline: number; // 0–10, learned over time
}

export interface SchedulePriors {
  morningWindow: "before-9am" | "9-11am" | "after-11am" | "varies";
  chaoticDays: number[]; // 0–6, Sun=0
  energyPeak: "morning" | "midday" | "evening" | "unpredictable";
}

// ─── Context ─────────────────────────────────────────────────────────────────

export interface Context {
  id: string;
  label: string;
  previousLabel: string | null; // Last label before most recent edit. Single field, not array.
  description: string;
  isNonNegotiable: boolean;
  nonNegotiableDetail: string | null; // e.g. "Barre — usually 6am Tues/Thurs"
  priority: number; // Onboarding order. Cold-start tiebreaker ONLY — loses influence as dataMaturity rises.
  status: "active" | "archived";
  lastFocusedAt: Timestamp | null; // Updated on accepted morning pick only.
  createdAt: Timestamp;
}

// ─── Task ────────────────────────────────────────────────────────────────────

export type EnergyLevel = "low" | "medium" | "high";
export type TaskStatus = "inbox" | "active" | "done" | "snoozed" | "someday" | "archived";
export type CompletedFrom = "morning-pick" | "inbox" | "mid-day";
export type EstimatedMins = 20 | 45 | 75 | 120 | 150;

export interface Task {
  id: string;
  title: string;
  contextId: string;
  status: TaskStatus;
  dueDate: Timestamp | null;
  energyRequired: EnergyLevel | null; // Claude-inferred async. null while pending or low-confidence.
  energyOverridden: boolean; // true = user set manually. Claude never overwrites when true.
  energyOverrideAt: Timestamp | null;
  energyOverrideValue: EnergyLevel | null;
  estimatedMins: EstimatedMins | null;
  promptVersion: string | null; // e.g. "energy-v1". Written with Claude inference result.
  snoozedUntil: Timestamp | null;
  snoozeCount: number; // Per-cycle. Resets to 0 after third-snooze prompt engagement.
  pickedCount: number; // Intentionally hidden in v1 — revisit for derived insights.
  completedAt: Timestamp | null;
  completedFrom: CompletedFrom | null;
  createdAt: Timestamp;
}

// ─── Checkin ─────────────────────────────────────────────────────────────────

export interface Checkin {
  date: string; // YYYY-MM-DD
  checkinHour: number; // 0–23
  dayOfWeek: number; // 0–6, Sun=0
  timeAvailableMins: 20 | 45 | 75 | 120; // User-entered. Real signal, not inferred.
  energyLevel: 1 | 2 | 3 | 4 | 5;
  pickedTaskId: string | null;
  pickedContextId: string | null;
  pickPosition: 1 | 2 | 3 | null; // Which pick in the frozen queue was accepted.
  pickedSuggestion: string; // Claude-generated text shown to user.
  promptVersion: string; // e.g. "pick-v1"
  userAccepted: boolean | null; // null = not yet resolved
  createdAt: Timestamp;
}

// ─── Download ────────────────────────────────────────────────────────────────

export type CompletedFocusTask = "yes" | "partial" | "no"; // Tri-state string — NOT boolean.
export type DerailerType = "external" | "energy" | "unclear";

export interface Download {
  date: string; // YYYY-MM-DD
  completedFocusTask: CompletedFocusTask;
  energyActual: 1 | 2 | 3 | 4 | 5;
  derailerType: DerailerType | null;
  derailerNote: string | null; // Freetext, max 280 chars
  nonNegotiablesProtected: Record<string, boolean | null>; // { [contextId]: boolean | null }
  energyDelta: number; // energyActual - morning energyLevel. Calculated at write time.
  createdAt: Timestamp;
}

// ─── Pattern ─────────────────────────────────────────────────────────────────

export type PatternType = "energy-window" | "neglect" | "derailer" | "non-neg";

export interface Pattern {
  type: PatternType;
  patternVersion: string; // e.g. "energy-window-v1"
  contextId: string | null;
  dayOfWeek: number | null;
  hourRange: [number, number] | null;
  insight: string; // Human-readable claim.
  confidence: number; // 0.0–1.0. Floor 0.0, cap 1.0.
  // < 0.4 = internal only | 0.4–0.7 = use in scoring | > 0.7 = Debrief eligible
  sampleSize: number;
  lastUpdated: Timestamp; // Patterns older than 14 days treated as absent by scoring function.
}

// ─── Waitlist ────────────────────────────────────────────────────────────────

export interface WaitlistEntry {
  email: string;
  createdAt: Timestamp;
}

// ─── Scoring (client-side, not persisted) ────────────────────────────────────

export interface ScoringContext {
  now: Date;
  timeAvailableMins: 20 | 45 | 75 | 120;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  dataMaturity: number; // 0.0–1.0. min(1.0, completedDownloads / 60). Never written to Firestore.
}

export interface ScoredCandidate {
  type: "task" | "context";
  task?: Task;
  context: Context;
  score: number;
}

export interface ScoringResult {
  empty: boolean;
  queue: ScoredCandidate[]; // Frozen at check-in time. Max 3. Never recomputed between rejections.
  pick: ScoredCandidate | null;
  dataMaturity: number;
}
