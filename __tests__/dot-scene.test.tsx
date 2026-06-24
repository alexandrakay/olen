import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("motion/react", () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) =>
      ({ children, style, animate, initial, exit, transition, "aria-hidden": ah, ...rest }: Record<string, unknown>) =>
        React.createElement(tag, { style, "aria-hidden": ah, ...rest }, children as React.ReactNode),
  }),
}));

import { DotScene } from "@/components/dot-scene";

test("renders the dot wordmark", () => {
  render(<DotScene />);
  expect(screen.getByText("dot")).toBeInTheDocument();
});

test("renders default caption", () => {
  render(<DotScene />);
  expect(screen.getByText("one thing at a time")).toBeInTheDocument();
});

test("renders custom caption", () => {
  render(<DotScene caption="here's where i'd start" />);
  expect(screen.getByText("here's where i'd start")).toBeInTheDocument();
});

test("renders without crashing with all custom props", () => {
  render(<DotScene accent="#B8A4D8" bg="#241A28" orb="#7BBFAA" caption="winding down" text="#FAF6EE" />);
  expect(screen.getByText("winding down")).toBeInTheDocument();
});
