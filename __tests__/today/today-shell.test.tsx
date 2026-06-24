import React from "react";
import { render, screen } from "@testing-library/react";
import { TodayShell } from "@/components/today/today-shell";

vi.mock("@/components/dot-scene", () => ({
  DotScene: ({ accent, bg, caption, text }: { accent?: string; bg?: string; caption?: string; text?: string }) => (
    <div data-testid="dot-scene" data-accent={accent} data-bg={bg} data-caption={caption} data-text={text} />
  ),
}));

test("renders children", () => {
  render(<TodayShell><p>Hello world</p></TodayShell>);
  expect(screen.getByText("Hello world")).toBeInTheDocument();
});

test("renders DotScene", () => {
  render(<TodayShell><p>content</p></TodayShell>);
  expect(screen.getByTestId("dot-scene")).toBeInTheDocument();
});

test("passes default accent to DotScene", () => {
  render(<TodayShell><p>content</p></TodayShell>);
  expect(screen.getByTestId("dot-scene")).toHaveAttribute("data-accent", "#F0956A");
});

test("passes custom accent to DotScene", () => {
  render(<TodayShell accent="#B8A4D8"><p>content</p></TodayShell>);
  expect(screen.getByTestId("dot-scene")).toHaveAttribute("data-accent", "#B8A4D8");
});

test("passes custom sceneBg to DotScene as bg", () => {
  render(<TodayShell sceneBg="#241A28"><p>content</p></TodayShell>);
  expect(screen.getByTestId("dot-scene")).toHaveAttribute("data-bg", "#241A28");
});

test("passes default caption to DotScene", () => {
  render(<TodayShell><p>content</p></TodayShell>);
  expect(screen.getByTestId("dot-scene")).toHaveAttribute("data-caption", "one thing at a time");
});

test("passes custom caption to DotScene", () => {
  render(<TodayShell caption="here's where I'd start"><p>content</p></TodayShell>);
  expect(screen.getByTestId("dot-scene")).toHaveAttribute("data-caption", "here's where I'd start");
});

test("passes custom sceneText to DotScene as text", () => {
  render(<TodayShell sceneText="#FAF6EE"><p>content</p></TodayShell>);
  expect(screen.getByTestId("dot-scene")).toHaveAttribute("data-text", "#FAF6EE");
});

test("scene aside is in the DOM", () => {
  render(<TodayShell><p>content</p></TodayShell>);
  expect(screen.getByRole("complementary")).toBeInTheDocument();
});

test("content main is in the DOM", () => {
  render(<TodayShell><p>content</p></TodayShell>);
  expect(screen.getByRole("main")).toBeInTheDocument();
});
