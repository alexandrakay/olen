"use client";

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      style={{ display: "flex", gap: "6px", padding: "20px 24px 0" }}
    >
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isComplete = step < current;
        const isActive = step === current;
        return (
          <div
            key={step}
            data-testid={`step-${step}`}
            data-complete={String(isComplete)}
            data-active={String(isActive)}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "2px",
              background: isComplete || isActive ? "#F0956A" : "#EDE4D4",
              transition: "background 0.2s",
            }}
          />
        );
      })}
    </div>
  );
}
