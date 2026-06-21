import type { Checkin, Task } from "@/lib/types";

export interface DownloadPrefill {
  preselect: "yes";
  subtext: string; // "marked done at HH:MM"
}

export function getDownloadPrefill(
  checkin: Checkin,
  pickedTask: Task | null,
): DownloadPrefill | null {
  if (!checkin.pickedTaskId) return null;
  if (checkin.userAccepted !== true) return null;
  if (!pickedTask) return null;
  if (pickedTask.status !== "done") return null;
  if (pickedTask.completedFrom !== "mid-day") return null;
  if (!pickedTask.completedAt) return null;

  const completedDate = pickedTask.completedAt.toDate();
  const hh = String(completedDate.getHours()).padStart(2, "0");
  const mm = String(completedDate.getMinutes()).padStart(2, "0");

  return { preselect: "yes", subtext: `marked done at ${hh}:${mm}` };
}
