"use client";

interface Props {
  onSnoozeAgain: () => void;
  onMoveSomeday: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export function SnoozeSheet({ onSnoozeAgain, onMoveSomeday, onRemove, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(61,44,32,0.4)",
        }}
      />

      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "#FAF6EE",
        borderRadius: "16px 16px 0 0",
        padding: "24px 24px 40px",
      }}>
        <p style={{
          fontFamily: "var(--font-outfit)",
          fontWeight: 500,
          fontSize: "17px",
          color: "#3D2C20",
          margin: "0 0 4px",
          textAlign: "center",
        }}>
          Still on your radar?
        </p>
        <p style={{
          fontFamily: "var(--font-lexend)",
          fontWeight: 300,
          fontSize: "14px",
          color: "rgba(61,44,32,0.6)",
          margin: "0 0 24px",
          textAlign: "center",
        }}>
          You&apos;ve snoozed this a few times.
        </p>

        <button
          onClick={onSnoozeAgain}
          style={{
            display: "block", width: "100%", borderRadius: "8px",
            background: "#F0956A", padding: "14px",
            color: "#FAF6EE", border: "none", cursor: "pointer",
            fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "16px",
            marginBottom: "10px",
          }}
        >
          Yes, snooze again
        </button>

        <button
          onClick={onMoveSomeday}
          style={{
            display: "block", width: "100%", borderRadius: "8px",
            background: "#FAF6EE", padding: "14px",
            color: "#3D2C20", border: "1.5px solid #EDE4D4", cursor: "pointer",
            fontFamily: "var(--font-lexend)", fontWeight: 400, fontSize: "16px",
            marginBottom: "10px",
          }}
        >
          Move it to someday
        </button>

        <button
          onClick={onRemove}
          style={{
            display: "block", background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--font-lexend)", fontWeight: 300, fontSize: "14px",
            color: "rgba(61,44,32,0.4)", padding: "8px 0", width: "100%",
          }}
        >
          Remove it
        </button>
      </div>
    </>
  );
}
