export const NOTIFICATION_COPY = "Ready when you are.";

const WINDOW_TO_TIME: Record<string, string> = {
  "before-9am": "07:30",
  "9-11am": "09:00",
  "after-11am": "10:30",
  varies: "08:00",
};

export function seedNotificationTime(morningWindow: string): string {
  return WINDOW_TO_TIME[morningWindow] ?? "08:00";
}

export function getEmailFallbackTime(notificationTime: string): string {
  const [h, m] = notificationTime.split(":").map(Number);
  const totalMins = h * 60 + m - 15;
  const fallbackH = Math.floor(totalMins / 60);
  const fallbackM = totalMins % 60;
  return `${String(fallbackH).padStart(2, "0")}:${String(fallbackM).padStart(2, "0")}`;
}

export function shouldNotifyNow(notificationTime: string, timezone: string, now: Date): boolean {
  const localTimeStr = now.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // toLocaleTimeString may return "HH:MM:SS" or "HH:MM" — normalize
  const localHHMM = localTimeStr.slice(0, 5);
  return localHHMM === notificationTime;
}

export const NOTIFICATION_TIME_OPTIONS: string[] = (() => {
  const opts: string[] = [];
  for (let mins = 5 * 60; mins <= 10 * 60; mins += 30) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    opts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return opts;
})();
