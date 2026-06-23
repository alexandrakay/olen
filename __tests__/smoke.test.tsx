import { render, screen } from "@testing-library/react";

function Hello({ name }: { name: string }) {
  return <p>Hello, {name}</p>;
}

test("renders text", () => {
  render(<Hello name="dot" />);
  expect(screen.getByText("Hello, dot")).toBeInTheDocument();
});
