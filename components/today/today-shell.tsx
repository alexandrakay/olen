"use client";

import type { ReactNode } from "react";
import { DotScene } from "@/components/dot-scene";

interface Props {
  children: ReactNode;
  /** Accent that themes the ambient scene (apricot morning, lavender evening, or the active context band). */
  accent?: string;
  /** Scene panel background. */
  sceneBg?: string;
  /** Caption shown under the breathing dot. */
  caption?: string;
  /** Scene text color (logo + caption). */
  sceneText?: string;
}

export function TodayShell({ children, accent = "#F0956A", sceneBg = "#F4ECDC", caption = "one thing at a time", sceneText = "#3D2C20" }: Props) {
  return (
    <div className="dot-shell">
      <aside className="dot-shell-scene">
        <DotScene accent={accent} bg={sceneBg} caption={caption} text={sceneText} />
      </aside>
      <main className="dot-shell-content">
        <div className="dot-shell-inner">{children}</div>
      </main>

      <style jsx>{`
        .dot-shell {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }
        .dot-shell-scene {
          flex: 0 0 46%;
          max-width: 46%;
        }
        .dot-shell-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px;
        }
        .dot-shell-inner {
          width: 100%;
          max-width: 440px;
        }
        @media (max-width: 900px) {
          .dot-shell-scene {
            display: none;
          }
          .dot-shell-content {
            padding: 0;
            align-items: stretch;
          }
          .dot-shell-inner {
            max-width: 480px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
