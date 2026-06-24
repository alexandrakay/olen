import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LandingScreen } from "@/components/landing-screen";

vi.mock("motion/react", () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) =>
      ({ children, onClick, disabled, style, animate, initial, exit, transition, whileTap, whileInView, viewport, "aria-hidden": ah, ...rest }: Record<string, unknown>) =>
        React.createElement(tag as string, { onClick, disabled, style, "aria-hidden": ah, ...rest }, children as React.ReactNode),
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

const mockSignIn = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({ signInWithGoogle: mockSignIn }),
}));

beforeEach(() => {
  mockSignIn.mockReset();
});

test("renders wordmark in nav", () => {
  render(<LandingScreen />);
  // "dot." appears at least once
  expect(screen.getAllByText(/dot/i).length).toBeGreaterThanOrEqual(1);
});

test("renders hero headline", () => {
  render(<LandingScreen />);
  expect(screen.getByText(/the focus tool for people with too much going on/i)).toBeInTheDocument();
});

test("renders hero body copy", () => {
  render(<LandingScreen />);
  expect(screen.getByText(/every morning, dot looks at everything/i)).toBeInTheDocument();
});

test("nav Get Dot button is present", () => {
  render(<LandingScreen />);
  expect(screen.getByRole("button", { name: /get dot$/i })).toBeInTheDocument();
});

test("hero CTA Start with one thing is present", () => {
  render(<LandingScreen />);
  expect(screen.getByRole("button", { name: /start with one thing/i })).toBeInTheDocument();
});

test("footer CTA Get Dot — it's free is present", () => {
  render(<LandingScreen />);
  expect(screen.getByRole("button", { name: /get dot.*free/i })).toBeInTheDocument();
});

test("renders all three how-it-works step titles", () => {
  render(<LandingScreen />);
  expect(screen.getByText("Check in")).toBeInTheDocument();
  expect(screen.getByText("Get one pick")).toBeInTheDocument();
  expect(screen.getByText("Or don't")).toBeInTheDocument();
});

test("renders philosophy quote", () => {
  render(<LandingScreen />);
  expect(screen.getByText(/low energy is data, not failure/i)).toBeInTheDocument();
});

test("nav Get Dot calls signInWithGoogle", async () => {
  mockSignIn.mockResolvedValue(undefined);
  render(<LandingScreen />);
  fireEvent.click(screen.getByRole("button", { name: /get dot$/i }));
  await waitFor(() => expect(mockSignIn).toHaveBeenCalled());
});

test("hero CTA calls signInWithGoogle", async () => {
  mockSignIn.mockResolvedValue(undefined);
  render(<LandingScreen />);
  fireEvent.click(screen.getByRole("button", { name: /start with one thing/i }));
  await waitFor(() => expect(mockSignIn).toHaveBeenCalled());
});

test("shows error message when sign-in throws", async () => {
  mockSignIn.mockRejectedValue(new Error("popup closed"));
  render(<LandingScreen />);
  fireEvent.click(screen.getByRole("button", { name: /get dot$/i }));
  await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument());
});

test("buttons show pending state while signing in", async () => {
  let resolve!: () => void;
  mockSignIn.mockReturnValue(new Promise<void>((r) => { resolve = r; }));
  render(<LandingScreen />);
  fireEvent.click(screen.getByRole("button", { name: /get dot$/i }));
  expect(screen.getAllByText("...").length).toBeGreaterThanOrEqual(1);
  resolve();
});
