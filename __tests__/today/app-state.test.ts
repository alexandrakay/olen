import { getAppState } from "@/lib/app-state";
import type { Checkin } from "@/lib/types";

const checkin = { date: "2026-06-20" } as Checkin;

function at(hour: number) {
  const d = new Date("2026-06-20T00:00:00");
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe("day-zero", () => {
  test("returns day-zero when no checkins ever and it is evening", () => {
    expect(getAppState(at(20), null, false)).toBe("day-zero");
  });

  test("returns day-zero when no checkins ever and it is late night", () => {
    expect(getAppState(at(2), null, false)).toBe("day-zero");
  });
});

describe("morning", () => {
  test("returns morning at 05:00 with no today checkin", () => {
    expect(getAppState(at(5), null, true)).toBe("morning");
  });

  test("returns morning at 17:59 with no today checkin", () => {
    expect(getAppState(at(17), null, true)).toBe("morning");
  });

  test("returns morning on first ever check-in during morning hours", () => {
    expect(getAppState(at(8), null, false)).toBe("morning");
  });
});

describe("mid-day", () => {
  test("returns mid-day when today checkin exists before 18:00", () => {
    expect(getAppState(at(14), checkin, true)).toBe("mid-day");
  });
});

describe("evening", () => {
  test("returns evening at 18:00 when has prior checkins", () => {
    expect(getAppState(at(18), null, true)).toBe("evening");
  });

  test("returns evening at 22:00 even with today checkin", () => {
    expect(getAppState(at(22), checkin, true)).toBe("evening");
  });
});

describe("morning-unavailable", () => {
  test("returns morning-unavailable before 05:00 with no today checkin and prior history", () => {
    expect(getAppState(at(3), null, true)).toBe("morning-unavailable");
  });
});
