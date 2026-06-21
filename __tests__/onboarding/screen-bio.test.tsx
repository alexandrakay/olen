import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenBio } from "@/components/onboarding/screen-bio";

const noop = async () => {};

test("next button is disabled when textarea is empty", () => {
  render(<ScreenBio onAdvance={noop} onBack={() => {}} advancing={false} />);
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("next button is enabled after typing content", async () => {
  const user = userEvent.setup();
  render(<ScreenBio onAdvance={noop} onBack={() => {}} advancing={false} />);
  await user.type(screen.getByRole("textbox"), "I juggle many things");
  expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
});

test("calls onAdvance with trimmed bio text", async () => {
  const user = userEvent.setup();
  const onAdvance = vi.fn().mockResolvedValue(undefined);
  render(<ScreenBio onAdvance={onAdvance} onBack={() => {}} advancing={false} />);
  await user.type(screen.getByRole("textbox"), "My life in a sentence");
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(onAdvance).toHaveBeenCalledWith("My life in a sentence");
});

test("next button is disabled while advancing", () => {
  render(<ScreenBio onAdvance={noop} onBack={() => {}} advancing={true} initialValue="some text" />);
  expect(screen.getByRole("button", { name: "..." })).toBeDisabled();
});
