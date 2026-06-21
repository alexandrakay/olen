import { buildPickTextPrompt, validatePickText, fallbackPickText, type PickCandidateInput } from "@/lib/pick-text";

const NOW = new Date("2026-06-20T09:00:00");

const taskCandidate: PickCandidateInput = {
  type: "task",
  taskTitle: "Send the invoice",
  taskEstimatedMins: 20,
  contextLabel: "Work",
  contextDescription: "Client projects",
  contextLastFocusedAtMs: new Date("2026-06-14T09:00:00").getTime(),
};

const ctxCandidate: PickCandidateInput = {
  type: "context",
  taskTitle: null,
  taskEstimatedMins: null,
  contextLabel: "Work",
  contextDescription: "Client projects",
  contextLastFocusedAtMs: new Date("2026-06-14T09:00:00").getTime(),
};

test("buildPickTextPrompt includes task title for task pick", () => {
  const prompt = buildPickTextPrompt(taskCandidate, "Builder.", 3, 45, NOW);
  expect(prompt.userMessage).toContain("Send the invoice");
});

test("buildPickTextPrompt includes context label for context pick", () => {
  const prompt = buildPickTextPrompt(ctxCandidate, "Builder.", 3, 45, NOW);
  expect(prompt.userMessage).toContain("Work");
});

test("buildPickTextPrompt includes days since last focused for context pick", () => {
  const prompt = buildPickTextPrompt(ctxCandidate, "Builder.", 3, 45, NOW);
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
  const text = fallbackPickText(taskCandidate, 3, 45);
  expect(text).toContain("Send the invoice");
});

test("fallbackPickText returns static string with context label for context pick", () => {
  const text = fallbackPickText(ctxCandidate, 3, 45);
  expect(text).toContain("Work");
});
