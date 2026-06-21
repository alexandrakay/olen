import { needsPaywall, isWithinGracePeriod } from "@/lib/trial";
import type { User } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

vi.mock("firebase/firestore", () => ({
  Timestamp: {
    fromMillis: (ms: number) => ({ toMillis: () => ms, toDate: () => new Date(ms) }),
    now: () => {
      const ms = Date.now();
      return { toMillis: () => ms, toDate: () => new Date(ms) };
    },
  },
}));

function makeUser(overrides: Partial<User>): User {
  const now = Date.now();
  return {
    uid: "u1",
    email: "a@b.com",
    displayName: "A",
    bio: "",
    createdAt: { toMillis: () => now, toDate: () => new Date(now) } as unknown as ReturnType<typeof Timestamp.now>,
    onboardingCompletedAt: null,
    trialEndsAt: { toMillis: () => now + 14 * 86400000, toDate: () => new Date(now + 14 * 86400000) } as unknown as ReturnType<typeof Timestamp.now>,
    onboardingStep: 5,
    onboardingComplete: true,
    subscriptionStatus: "trial",
    stripeCustomerId: null,
    timezone: "America/New_York",
    schedulePriors: { morningWindow: "varies", chaoticDays: [], energyPeak: "unpredictable" },
    notificationsEnabled: false,
    notificationTime: "07:30",
    energyBaseline: 5,
    ...overrides,
  } as User;
}

const now = new Date("2026-06-20T12:00:00Z");

// ─── needsPaywall ──────────────────────────────────────────────────────────────

test("needsPaywall false for active subscription", () => {
  const user = makeUser({ subscriptionStatus: "active" });
  expect(needsPaywall(user, now)).toBe(false);
});

test("needsPaywall false for trial within grace period", () => {
  const trialEndsAt = {
    toMillis: () => now.getTime() - 10 * 3600000, // ended 10h ago, within 24h grace
    toDate: () => new Date(now.getTime() - 10 * 3600000),
  } as unknown as ReturnType<typeof Timestamp.now>;
  const user = makeUser({ subscriptionStatus: "trial", trialEndsAt });
  expect(needsPaywall(user, now)).toBe(false);
});

test("needsPaywall true for trial past grace period", () => {
  const trialEndsAt = {
    toMillis: () => now.getTime() - 25 * 3600000, // ended 25h ago, past 24h grace
    toDate: () => new Date(now.getTime() - 25 * 3600000),
  } as unknown as ReturnType<typeof Timestamp.now>;
  const user = makeUser({ subscriptionStatus: "trial", trialEndsAt });
  expect(needsPaywall(user, now)).toBe(true);
});

test("needsPaywall true for expired subscription", () => {
  const user = makeUser({ subscriptionStatus: "expired" });
  expect(needsPaywall(user, now)).toBe(true);
});

test("needsPaywall true when status is cancelled", () => {
  const user = makeUser({ subscriptionStatus: "cancelled" });
  expect(needsPaywall(user, now)).toBe(true);
});

test("needsPaywall false for past_due (banner, not wall)", () => {
  const user = makeUser({ subscriptionStatus: "past_due" });
  expect(needsPaywall(user, now)).toBe(false);
});

// ─── isWithinGracePeriod ───────────────────────────────────────────────────────

test("isWithinGracePeriod true when trial just ended", () => {
  const trialEndsAt = {
    toMillis: () => now.getTime() - 1 * 3600000,
    toDate: () => new Date(now.getTime() - 1 * 3600000),
  } as unknown as ReturnType<typeof Timestamp.now>;
  expect(isWithinGracePeriod(trialEndsAt, now)).toBe(true);
});

test("isWithinGracePeriod false when past 24h grace", () => {
  const trialEndsAt = {
    toMillis: () => now.getTime() - 25 * 3600000,
    toDate: () => new Date(now.getTime() - 25 * 3600000),
  } as unknown as ReturnType<typeof Timestamp.now>;
  expect(isWithinGracePeriod(trialEndsAt, now)).toBe(false);
});

test("isWithinGracePeriod true when trial hasn't ended yet", () => {
  const trialEndsAt = {
    toMillis: () => now.getTime() + 3 * 86400000,
    toDate: () => new Date(now.getTime() + 3 * 86400000),
  } as unknown as ReturnType<typeof Timestamp.now>;
  expect(isWithinGracePeriod(trialEndsAt, now)).toBe(true);
});
