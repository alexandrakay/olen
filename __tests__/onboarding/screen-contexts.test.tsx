import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenContexts } from "@/components/onboarding/screen-contexts";

const noop = async () => {};

async function addContext(user: ReturnType<typeof userEvent.setup>, label: string, description = "Progress looks like moving forward") {
  await user.type(screen.getByPlaceholderText(/context name/i), label);
  await user.type(screen.getByPlaceholderText(/progress/i), description);
  await user.click(screen.getByRole("button", { name: /add/i }));
}

test("next button is disabled with no contexts", () => {
  render(<ScreenContexts onAdvance={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("added context label appears in the list", async () => {
  const user = userEvent.setup();
  render(<ScreenContexts onAdvance={noop} onBack={() => {}} advancing={false} />);
  await addContext(user, "Work");
  expect(screen.getByText("Work")).toBeInTheDocument();
});

test("next button is enabled after adding one context", async () => {
  const user = userEvent.setup();
  render(<ScreenContexts onAdvance={noop} onBack={() => {}} advancing={false} />);
  await addContext(user, "Work");
  expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
});

test("add form is hidden after 5 contexts", async () => {
  const user = userEvent.setup();
  render(<ScreenContexts onAdvance={noop} onBack={() => {}} advancing={false} />);
  for (let i = 1; i <= 5; i++) {
    await addContext(user, `Context ${i}`);
  }
  expect(screen.queryByRole("button", { name: /add/i })).not.toBeInTheDocument();
});

test("calls onAdvance with all added contexts", async () => {
  const user = userEvent.setup();
  const onAdvance = vi.fn().mockResolvedValue(undefined);
  render(<ScreenContexts onAdvance={onAdvance} onBack={() => {}} advancing={false} />);
  await addContext(user, "Work", "Ship product");
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(onAdvance).toHaveBeenCalledWith([{ label: "Work", description: "Ship product" }]);
});
