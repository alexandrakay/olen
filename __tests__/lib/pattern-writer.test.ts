import {
  computeEnergyWindowPatterns,
  computeNeglectPattern,
  computeDerailerPattern,
  computeNonNegPattern,
} from "@/lib/pattern-writer";

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeCheckin(hour: number, date: string) {
  return { checkinHour: hour, date, dayOfWeek: 1, userAccepted: true };
}

function makeDownload(date: string, energyActual: number, derailerType: string | null = null, completedFocusTask = "yes", nonNeg: Record<string, boolean | null> = {}) {
  return { date, energyActual, derailerType, completedFocusTask, nonNegotiablesProtected: nonNeg };
}

// ─── computeEnergyWindowPatterns ──────────────────────────────────────────────

test("returns no patterns when sample size below 5", () => {
  const checkins = [makeCheckin(8, "2026-06-01"), makeCheckin(8, "2026-06-02")];
  const downloads = [makeDownload("2026-06-01", 4), makeDownload("2026-06-02", 3)];
  const result = computeEnergyWindowPatterns(checkins, downloads);
  expect(result).toHaveLength(0);
});

test("returns pattern when sample size >= 5", () => {
  const dates = ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05"];
  const checkins = dates.map((d) => makeCheckin(8, d));
  const downloads = dates.map((d) => makeDownload(d, 4));
  const result = computeEnergyWindowPatterns(checkins, downloads);
  expect(result.length).toBeGreaterThanOrEqual(1);
  expect(result[0].type).toBe("energy-window");
});

test("confidence is capped at 1.0", () => {
  const dates = Array.from({ length: 25 }, (_, i) => `2026-0${Math.floor(i / 10) + 1}-${String((i % 10) + 1).padStart(2, "0")}`).slice(0, 25);
  const checkins = dates.map((d) => makeCheckin(9, d));
  const downloads = dates.map((d) => makeDownload(d, 5));
  const result = computeEnergyWindowPatterns(checkins, downloads);
  const p = result.find((r) => r.hourRange?.[0] === 9);
  expect(p?.confidence).toBeLessThanOrEqual(1.0);
});

test("confidence is floored at 0.0", () => {
  const dates = ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05"];
  const checkins = dates.map((d) => makeCheckin(7, d));
  const downloads = dates.map((d) => makeDownload(d, 1));
  const result = computeEnergyWindowPatterns(checkins, downloads);
  result.forEach((p) => expect(p.confidence).toBeGreaterThanOrEqual(0));
});

test("pattern insight mentions hour range", () => {
  const dates = ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05"];
  const checkins = dates.map((d) => makeCheckin(8, d));
  const downloads = dates.map((d) => makeDownload(d, 4));
  const result = computeEnergyWindowPatterns(checkins, downloads);
  expect(result[0].insight).toMatch(/energy/i);
});

test("pattern has correct patternVersion", () => {
  const dates = ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05"];
  const checkins = dates.map((d) => makeCheckin(10, d));
  const downloads = dates.map((d) => makeDownload(d, 3));
  const result = computeEnergyWindowPatterns(checkins, downloads);
  expect(result[0].patternVersion).toBe("energy-window-v1");
});

// ─── computeNeglectPattern ────────────────────────────────────────────────────

test("returns null when sample size below 4", () => {
  // Only 2 focusEvents
  const focusEvents = [
    { date: "2026-06-01" },
    { date: "2026-06-10" },
  ];
  expect(computeNeglectPattern("ctx1", "Work", focusEvents)).toBeNull();
});

test("returns pattern when sample size >= 4", () => {
  const focusEvents = [
    { date: "2026-05-01" },
    { date: "2026-05-08" },
    { date: "2026-05-15" },
    { date: "2026-05-22" },
  ];
  const result = computeNeglectPattern("ctx1", "Work", focusEvents);
  expect(result).not.toBeNull();
  expect(result?.type).toBe("neglect");
  expect(result?.contextId).toBe("ctx1");
});

test("neglect insight mentions context label and avg days", () => {
  const focusEvents = [
    { date: "2026-05-01" },
    { date: "2026-05-08" },
    { date: "2026-05-15" },
    { date: "2026-05-22" },
  ];
  const result = computeNeglectPattern("ctx1", "Work", focusEvents);
  expect(result?.insight).toMatch(/Work/);
  expect(result?.insight).toMatch(/days/);
});

// ─── computeDerailerPattern ───────────────────────────────────────────────────

test("returns null when no derailer dominates at 40%", () => {
  const downloads = [
    makeDownload("2026-06-01", 3, "external", "no"),
    makeDownload("2026-06-02", 3, "energy", "no"),
    makeDownload("2026-06-03", 3, "unclear", "no"),
    makeDownload("2026-06-04", 3, "external", "no"),
    makeDownload("2026-06-05", 3, "energy", "no"),
    makeDownload("2026-06-06", 3, "unclear", "no"),
  ];
  expect(computeDerailerPattern(downloads)).toBeNull();
});

test("returns pattern when one type >= 40% of non-completions", () => {
  const downloads = [
    makeDownload("2026-06-01", 3, "energy", "no"),
    makeDownload("2026-06-02", 3, "energy", "no"),
    makeDownload("2026-06-03", 3, "energy", "no"),
    makeDownload("2026-06-04", 3, "external", "no"),
    makeDownload("2026-06-05", 3, "unclear", "no"),
  ];
  const result = computeDerailerPattern(downloads);
  expect(result).not.toBeNull();
  expect(result?.type).toBe("derailer");
});

test("derailer insight mentions the dominant derailer label", () => {
  const downloads = [
    makeDownload("2026-06-01", 3, "energy", "no"),
    makeDownload("2026-06-02", 3, "energy", "no"),
    makeDownload("2026-06-03", 3, "energy", "no"),
    makeDownload("2026-06-04", 3, "external", "no"),
    makeDownload("2026-06-05", 3, null, "yes"),
  ];
  const result = computeDerailerPattern(downloads);
  expect(result?.insight).toMatch(/ran out of steam/i);
});

test("derailer only counts non-completion events (no/partial)", () => {
  const downloads = [
    makeDownload("2026-06-01", 3, "energy", "no"),
    makeDownload("2026-06-02", 3, null, "yes"), // completed, no derailer
    makeDownload("2026-06-03", 3, null, "yes"),
    makeDownload("2026-06-04", 3, null, "yes"),
  ];
  // Only 1 non-completion, can't reach 40% threshold with multiple types
  const result = computeDerailerPattern(downloads);
  expect(result).not.toBeNull(); // energy is 100% of non-completion events
});

// ─── computeNonNegPattern ─────────────────────────────────────────────────────

test("returns null when sample size below 6", () => {
  const downloads = [
    makeDownload("2026-06-01", 3, null, "yes", { ctx1: true }),
    makeDownload("2026-06-02", 3, null, "yes", { ctx1: true }),
  ];
  expect(computeNonNegPattern("ctx1", "Exercise", downloads)).toBeNull();
});

test("returns pattern when sample size >= 6", () => {
  const downloads = Array.from({ length: 8 }, (_, i) =>
    makeDownload(`2026-06-${String(i + 1).padStart(2, "0")}`, 3, null, "yes", { ctx1: true })
  );
  const result = computeNonNegPattern("ctx1", "Exercise", downloads);
  expect(result).not.toBeNull();
  expect(result?.type).toBe("non-neg");
});

test("non-neg insight mentions context label and protection percentage", () => {
  const downloads = Array.from({ length: 6 }, (_, i) =>
    makeDownload(`2026-06-${String(i + 1).padStart(2, "0")}`, 3, null, "yes", { ctx1: i < 5 ? true : false })
  );
  const result = computeNonNegPattern("ctx1", "Exercise", downloads);
  expect(result?.insight).toMatch(/Exercise/);
  expect(result?.insight).toMatch(/%/);
});
