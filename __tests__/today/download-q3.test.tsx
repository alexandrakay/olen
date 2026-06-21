import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DownloadQ3 } from "@/components/today/download-q3";

test("renders all three derailer options", () => {
  render(<DownloadQ3 onAnswer={vi.fn()} />);
  expect(screen.getByText(/life got loud/i)).toBeInTheDocument();
  expect(screen.getByText(/ran out of steam/i)).toBeInTheDocument();
  expect(screen.getByText(/honestly not sure/i)).toBeInTheDocument();
});

test("calls onAnswer with external derailer", async () => {
  const user = userEvent.setup();
  const onAnswer = vi.fn();
  render(<DownloadQ3 onAnswer={onAnswer} />);
  await user.click(screen.getByText(/life got loud/i));
  expect(onAnswer).toHaveBeenCalledWith({ derailerType: "external", derailerNote: null });
});

test("calls onAnswer with energy derailer", async () => {
  const user = userEvent.setup();
  const onAnswer = vi.fn();
  render(<DownloadQ3 onAnswer={onAnswer} />);
  await user.click(screen.getByText(/ran out of steam/i));
  expect(onAnswer).toHaveBeenCalledWith({ derailerType: "energy", derailerNote: null });
});

test("calls onAnswer with unclear derailer", async () => {
  const user = userEvent.setup();
  const onAnswer = vi.fn();
  render(<DownloadQ3 onAnswer={onAnswer} />);
  await user.click(screen.getByText(/honestly not sure/i));
  expect(onAnswer).toHaveBeenCalledWith({ derailerType: "unclear", derailerNote: null });
});

test("freetext is collapsed by default", () => {
  render(<DownloadQ3 onAnswer={vi.fn()} />);
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});

test("freetext expands on tap", async () => {
  const user = userEvent.setup();
  render(<DownloadQ3 onAnswer={vi.fn()} />);
  await user.click(screen.getByText(/add a note/i));
  expect(screen.getByRole("textbox")).toBeInTheDocument();
});

test("freetext included in answer when typed", async () => {
  const user = userEvent.setup();
  const onAnswer = vi.fn();
  render(<DownloadQ3 onAnswer={onAnswer} />);
  await user.click(screen.getByText(/add a note/i));
  await user.type(screen.getByRole("textbox"), "Had a dentist appointment");
  await user.click(screen.getByText(/life got loud/i));
  expect(onAnswer).toHaveBeenCalledWith({
    derailerType: "external",
    derailerNote: "Had a dentist appointment",
  });
});
