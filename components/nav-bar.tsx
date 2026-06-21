"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/today",
    label: "Today",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="14" rx="2" stroke={active ? "#F0956A" : "#3D2C20"} strokeWidth="1.5" strokeOpacity={active ? 1 : 0.4} />
        <path d="M7 3v4M15 3v4M3 10h16" stroke={active ? "#F0956A" : "#3D2C20"} strokeWidth="1.5" strokeLinecap="round" strokeOpacity={active ? 1 : 0.4} />
      </svg>
    ),
  },
  {
    href: "/inbox",
    label: "Inbox",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="2" stroke={active ? "#F0956A" : "#3D2C20"} strokeWidth="1.5" strokeOpacity={active ? 1 : 0.4} />
        <path d="M7 8h8M7 12h5" stroke={active ? "#F0956A" : "#3D2C20"} strokeWidth="1.5" strokeLinecap="round" strokeOpacity={active ? 1 : 0.4} />
      </svg>
    ),
  },
  {
    href: "/account",
    label: "Account",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" stroke={active ? "#F0956A" : "#3D2C20"} strokeWidth="1.5" strokeOpacity={active ? 1 : 0.4} />
        <path d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={active ? "#F0956A" : "#3D2C20"} strokeWidth="1.5" strokeLinecap="round" strokeOpacity={active ? 1 : 0.4} />
      </svg>
    ),
  },
];

export function NavBar({ evening = false }: { evening?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: evening ? "var(--color-plum)" : "#FAF6EE",
        borderTop: `1px solid ${evening ? "rgba(250,246,238,0.08)" : "#EDE4D4"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              textDecoration: "none",
              padding: "8px 20px",
            }}
          >
            {item.icon(active)}
            <span
              style={{
                fontFamily: "var(--font-lexend)",
                fontWeight: 400,
                fontSize: "10px",
                color: active ? "#F0956A" : evening ? "rgba(250,246,238,0.4)" : "rgba(61,44,32,0.4)",
                letterSpacing: "0.03em",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
