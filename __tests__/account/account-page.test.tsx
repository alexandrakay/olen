import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

const mockSignOut = vi.fn().mockResolvedValue(undefined);
const mockRouterReplace = vi.fn();

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    firebaseUser: { uid: "user1" },
    userDoc: null,
    loading: false,
    signOut: mockSignOut,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ docs: [], empty: true }),
  writeBatch: vi.fn(() => ({ update: vi.fn(), commit: vi.fn() })),
  Timestamp: { now: () => ({}) },
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("@/components/account/context-row", () => ({
  ContextRow: () => null,
}));
vi.mock("@/components/account/context-form", () => ({
  ContextForm: () => null,
}));
vi.mock("@/components/account/archive-sheet", () => ({
  ArchiveSheet: () => null,
}));
vi.mock("@/components/account/notification-settings", () => ({
  NotificationSettings: () => null,
}));
vi.mock("@/lib/context-management", () => ({
  canAddContext: () => ({ warn: false }),
  SOFT_LIMIT_WARNING: "",
}));
vi.mock("@/components/auth-loading", () => ({
  AuthLoading: () => <div>Loading</div>,
}));
vi.mock("@/components/nav-bar", () => ({
  NavBar: () => null,
}));

import AccountPage from "@/app/account/page";

beforeEach(() => {
  mockSignOut.mockClear();
  mockRouterReplace.mockClear();
});

test("renders a Sign out button", () => {
  render(<AccountPage />);
  expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
});

test("clicking Sign out calls signOut", async () => {
  const user = userEvent.setup();
  render(<AccountPage />);
  await user.click(screen.getByRole("button", { name: /sign out/i }));
  expect(mockSignOut).toHaveBeenCalled();
});

test("clicking Sign out navigates to /", async () => {
  const user = userEvent.setup();
  render(<AccountPage />);
  await user.click(screen.getByRole("button", { name: /sign out/i }));
  await screen.findByRole("button", { name: /sign out/i }); // wait for async
  expect(mockRouterReplace).toHaveBeenCalledWith("/");
});
