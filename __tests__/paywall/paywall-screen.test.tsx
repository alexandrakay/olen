import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PaywallScreen } from "@/components/paywall-screen";

vi.mock("@/app/actions/create-checkout", () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
}));

const originalLocation = window.location;
beforeAll(() => {
  Object.defineProperty(window, "location", { writable: true, value: { href: "" } });
});
afterAll(() => {
  Object.defineProperty(window, "location", { writable: true, value: originalLocation });
});

test("renders completedDownloads count in copy", () => {
  render(<PaywallScreen completedDownloads={7} userEmail="a@b.com" uid="u1" />);
  expect(screen.getByText(/dot has logged 7 days with you/i)).toBeInTheDocument();
});

test("renders CTA with price", () => {
  render(<PaywallScreen completedDownloads={3} userEmail="a@b.com" uid="u1" />);
  expect(screen.getByRole("button", { name: /continue with dot/i })).toBeInTheDocument();
  expect(screen.getByText(/\$12\/mo/i)).toBeInTheDocument();
});

test("renders data-preserved copy", () => {
  render(<PaywallScreen completedDownloads={3} userEmail="a@b.com" uid="u1" />);
  expect(screen.getByText(/tasks, contexts, and history are saved/i)).toBeInTheDocument();
});

test("renders support email", () => {
  render(<PaywallScreen completedDownloads={3} userEmail="a@b.com" uid="u1" />);
  expect(screen.getByText(/hello@olen\.day/i)).toBeInTheDocument();
});

test("no maybe-later option present", () => {
  render(<PaywallScreen completedDownloads={3} userEmail="a@b.com" uid="u1" />);
  expect(screen.queryByText(/maybe later/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/remind me/i)).not.toBeInTheDocument();
});

test("CTA calls createCheckoutSession and redirects", async () => {
  const { createCheckoutSession } = await import("@/app/actions/create-checkout");
  render(<PaywallScreen completedDownloads={3} userEmail="a@b.com" uid="u1" />);
  fireEvent.click(screen.getByRole("button", { name: /continue with dot/i }));
  await waitFor(() => {
    expect(createCheckoutSession).toHaveBeenCalledWith({ uid: "u1", email: "a@b.com" });
  });
});

test("CTA shows loading state while processing", async () => {
  render(<PaywallScreen completedDownloads={3} userEmail="a@b.com" uid="u1" />);
  fireEvent.click(screen.getByRole("button", { name: /continue with dot/i }));
  expect(screen.getByRole("button", { name: /continue with dot/i })).toBeDisabled();
});
