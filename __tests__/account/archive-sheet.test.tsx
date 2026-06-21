import { render, screen, fireEvent } from "@testing-library/react";
import { ArchiveSheet } from "@/components/account/archive-sheet";
import type { Context } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

vi.mock("firebase/firestore", () => ({
  Timestamp: { now: () => ({ toDate: () => new Date() }) },
}));

const ctx: Context = {
  id: "ctx1",
  label: "Work",
  previousLabel: null,
  description: "",
  isNonNegotiable: false,
  nonNegotiableDetail: null,
  priority: 1,
  status: "active",
  lastFocusedAt: null,
  createdAt: { toDate: () => new Date() } as unknown as ReturnType<typeof Timestamp.now>,
};

test("shows incomplete task count in copy", () => {
  render(
    <ArchiveSheet
      context={ctx}
      incompleteTaskCount={3}
      otherContexts={[]}
      onMoveAll={vi.fn()}
      onCompleteAll={vi.fn()}
      onClose={vi.fn()}
    />
  );
  expect(screen.getByText(/3 incomplete/i)).toBeInTheDocument();
});

test("move all button calls onMoveAll with selected context", () => {
  const onMoveAll = vi.fn();
  const other: Context = { ...ctx, id: "ctx2", label: "Health" };
  render(
    <ArchiveSheet
      context={ctx}
      incompleteTaskCount={2}
      otherContexts={[other]}
      onMoveAll={onMoveAll}
      onCompleteAll={vi.fn()}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: /move all/i }));
  fireEvent.click(screen.getByText("Health"));
  fireEvent.click(screen.getByRole("button", { name: /confirm move/i }));
  expect(onMoveAll).toHaveBeenCalledWith("ctx2");
});

test("mark all done calls onCompleteAll", () => {
  const onCompleteAll = vi.fn();
  render(
    <ArchiveSheet
      context={ctx}
      incompleteTaskCount={2}
      otherContexts={[]}
      onMoveAll={vi.fn()}
      onCompleteAll={onCompleteAll}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: /mark all done/i }));
  fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
  expect(onCompleteAll).toHaveBeenCalled();
});

test("close button calls onClose", () => {
  const onClose = vi.fn();
  render(
    <ArchiveSheet
      context={ctx}
      incompleteTaskCount={2}
      otherContexts={[]}
      onMoveAll={vi.fn()}
      onCompleteAll={vi.fn()}
      onClose={onClose}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
  expect(onClose).toHaveBeenCalled();
});
