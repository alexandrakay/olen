import type { Checkin } from "@/lib/types";

export type AppState =
  | "day-zero"
  | "morning"
  | "mid-day"
  | "evening"
  | "morning-unavailable";

export function getAppState(
  now: Date,
  todayCheckin: Checkin | null,
  hasAnyCheckin: boolean
): AppState {
  const hour = now.getHours();

  // Evening is unconditional at 18:00, but not on day zero (Download needs history)
  if (hour >= 18) return hasAnyCheckin ? "evening" : "day-zero";

  // Today's check-in done — mid-day (before 18:00 check above handles evening override)
  if (todayCheckin) return "mid-day";

  // Morning window: 05:00–18:00 (first-ever check-in also uses this path)
  if (hour >= 5) return "morning";

  // Outside morning hours, no today check-in
  return hasAnyCheckin ? "morning-unavailable" : "day-zero";
}
