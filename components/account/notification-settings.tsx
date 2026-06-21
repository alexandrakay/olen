"use client";

import { NOTIFICATION_TIME_OPTIONS } from "@/lib/notifications";

interface Props {
  enabled: boolean;
  notificationTime: string;
  onToggle: () => void;
  onTimeChange: (time: string) => void;
}

export function NotificationSettings({ enabled, notificationTime, onToggle, onTimeChange }: Props) {
  return (
    <div style={{ marginTop: "32px" }}>
      <p
        style={{
          fontFamily: "var(--font-outfit)",
          fontWeight: 600,
          fontSize: "18px",
          color: "#3D2C20",
          marginBottom: "16px",
        }}
      >
        Morning notification
      </p>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          padding: "12px 14px",
          borderRadius: "8px",
          border: "1.5px solid #EDE4D4",
          background: "#FAF6EE",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-lexend)",
            fontWeight: 300,
            fontSize: "15px",
            color: "#3D2C20",
          }}
        >
          Send morning notification
        </span>
        <input
          type="checkbox"
          role="checkbox"
          aria-label="Morning notification"
          checked={enabled}
          onChange={onToggle}
        />
      </label>

      {enabled && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1.5px solid #EDE4D4",
            background: "#FAF6EE",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-lexend)",
              fontWeight: 300,
              fontSize: "15px",
              color: "#3D2C20",
            }}
          >
            Send at
          </span>
          <select
            value={notificationTime}
            onChange={(e) => onTimeChange(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              fontFamily: "var(--font-lexend)",
              fontWeight: 400,
              fontSize: "15px",
              color: "#3D2C20",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {NOTIFICATION_TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {formatTime(t)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "am" : "pm";
  const display = h > 12 ? h - 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${ampm}`;
}
