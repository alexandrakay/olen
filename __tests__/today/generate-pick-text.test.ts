import { buildPickTextPrompt, validatePickText, fallbackPickText } from "@/lib/pick-text";
import type { PickTextInput } from "@/lib/pick-text";

const taskInput: PickTextInput = {
  type: "task",
  taskTitle: "Send the invoice",
  taskEstimatedMins: 20,
  contextLabel: "Work",
  contextDescription: "Client projects",
  daysSinceLastFocused: null,
};

const ctxInput: PickTextInput = {
  type: "context",
  taskTitle: null,
  taskEstimatedMins: null,
  contextLabel: "Work",
  contextDescription: "Client projects",
  daysSinceLastFocused: 6,
};

test("buildPickTextPrompt includes task title for task pick", () => {
  const prompt = buildPickTextPrompt(taskInput, "Builder.", 3, 45);
  expect(prompt.userMessage).toContain("Send the invoice");
});

test("buildPickTextPrompt includes context label for context pick", () => {
  const prompt = buildPickTextPrompt(ctxInput, "Builder.", 3, 45);
  expect(prompt.userMessage).toContain("Work");
});

test("buildPickTextPrompt includes days since last focused for context pick", () => {
  const prompt = buildPickTextPrompt(ctxInput, "Builder.", 3, 45);
  expect(prompt.userMessage).toContain("6");
});

test("validatePickText passes for short text", () => {
  expect(validatePickText("Send it now. Just one minute.")).toBe(true);
});

test("validatePickText fails for text over 200 chars", () => {
  expect(validatePickText("a".repeat(201))).toBe(false);
});

test("validatePickText fails for more than 2 sentences", () => {
  expect(validatePickText("One. Two. Three.")).toBe(false);
});

test("fallbackPickText returns static string with task title", () => {
  const text = fallbackPickText(taskInput, 3, 45);
  expect(text).toContain("Send the invoice");
});

test("fallbackPickText returns static string with context label for context pick", () => {
  const text = fallbackPickText(ctxInput, 3, 45);
  expect(text).toContain("Work");
});
