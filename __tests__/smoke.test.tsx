import { render, screen } from "@testing-library/react";

function Hello({ name }: { name: string }) {
  return <p>Hello, {name}</p>;
}

test("renders text", () => {
  render(<Hello name="olen" />);
  expect(screen.getByText("Hello, olen")).toBeInTheDocument();
});
