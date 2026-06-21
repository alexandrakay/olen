import {
  seedNotificationTime,
  getEmailFallbackTime,
  shouldNotifyNow,
  NOTIFICATION_COPY,
  NOTIFICATION_TIME_OPTIONS,
} from "@/lib/notifications";

// ─── seedNotificationTime ──────────────────────────────────────────────────────

test("before-9am seeds to 07:30", () => {
  expect(seedNotificationTime("before-9am")).toBe("07:30");
});

test("9-11am seeds to 09:00", () => {
  expect(seedNotificationTime("9-11am")).toBe("09:00");
});

test("after-11am seeds to 10:30", () => {
  expect(seedNotificationTime("after-11am")).toBe("10:30");
});

test("varies seeds to 08:00", () => {
  expect(seedNotificationTime("varies")).toBe("08:00");
});

// ─── getEmailFallbackTime ─────────────────────────────────────────────────────

test("email fallback is 15 min before push time", () => {
  expect(getEmailFallbackTime("09:00")).toBe("08:45");
});

test("email fallback wraps correctly at hour boundary", () => {
  expect(getEmailFallbackTime("08:00")).toBe("07:45");
});

test("email fallback wraps at 05:00", () => {
  expect(getEmailFallbackTime("05:00")).toBe("04:45");
});

// ─── shouldNotifyNow ──────────────────────────────────────────────────────────

test("shouldNotifyNow true when local time matches notificationTime", () => {
  // User in UTC, notificationTime 09:00, now is 09:00 UTC
  const now = new Date("2026-06-20T09:00:00Z");
  expect(shouldNotifyNow("09:00", "UTC", now)).toBe(true);
});

test("shouldNotifyNow false when local time does not match", () => {
  const now = new Date("2026-06-20T10:00:00Z");
  expect(shouldNotifyNow("09:00", "UTC", now)).toBe(false);
});

test("shouldNotifyNow respects timezone offset", () => {
  // User in America/New_York (UTC-4 in summer), notificationTime 07:30
  // 07:30 Eastern = 11:30 UTC
  const now = new Date("2026-06-20T11:30:00Z");
  expect(shouldNotifyNow("07:30", "America/New_York", now)).toBe(true);
});

test("shouldNotifyNow false for wrong UTC time given timezone", () => {
  const now = new Date("2026-06-20T09:00:00Z");
  expect(shouldNotifyNow("07:30", "America/New_York", now)).toBe(false);
});

// ─── constants ────────────────────────────────────────────────────────────────

test("NOTIFICATION_COPY is exactly 'Ready when you are.'", () => {
  expect(NOTIFICATION_COPY).toBe("Ready when you are.");
});

test("NOTIFICATION_TIME_OPTIONS has 30-min increments from 05:00 to 10:00", () => {
  expect(NOTIFICATION_TIME_OPTIONS[0]).toBe("05:00");
  expect(NOTIFICATION_TIME_OPTIONS[NOTIFICATION_TIME_OPTIONS.length - 1]).toBe("10:00");
  expect(NOTIFICATION_TIME_OPTIONS.length).toBe(11); // 05:00, 05:30, ..., 10:00
});

test("all NOTIFICATION_TIME_OPTIONS are 30-min apart", () => {
  for (let i = 1; i < NOTIFICATION_TIME_OPTIONS.length; i++) {
    const [h0, m0] = NOTIFICATION_TIME_OPTIONS[i - 1].split(":").map(Number);
    const [h1, m1] = NOTIFICATION_TIME_OPTIONS[i].split(":").map(Number);
    const diff = (h1 * 60 + m1) - (h0 * 60 + m0);
    expect(diff).toBe(30);
  }
});
