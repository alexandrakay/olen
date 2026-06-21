import { buildEnergyPrompt, validateEnergyOutput, ENERGY_FALLBACK } from "@/lib/energy-inference";

test("buildEnergyPrompt includes task title", () => {
  const { userMessage } = buildEnergyPrompt("Send the invoice", "Builder.", "Work", "Client projects");
  expect(userMessage).toContain("Send the invoice");
});

test("buildEnergyPrompt includes bio", () => {
  const { userMessage } = buildEnergyPrompt("Send the invoice", "Builder working on products.", "Work", "");
  expect(userMessage).toContain("Builder working on products.");
});

test("buildEnergyPrompt includes context", () => {
  const { userMessage } = buildEnergyPrompt("Do taxes", "Builder.", "Finance", "Money stuff");
  expect(userMessage).toContain("Finance");
});

test("system prompt requires valid JSON output", () => {
  const { systemPrompt } = buildEnergyPrompt("task", "bio", "ctx", "desc");
  expect(systemPrompt).toMatch(/json/i);
});

test("validateEnergyOutput accepts valid low energy", () => {
  const result = validateEnergyOutput('{"energyRequired":"low","estimatedMins":20}');
  expect(result).toEqual({ energyRequired: "low", estimatedMins: 20 });
});

test("validateEnergyOutput accepts valid null estimatedMins", () => {
  const result = validateEnergyOutput('{"energyRequired":"high","estimatedMins":null}');
  expect(result).toEqual({ energyRequired: "high", estimatedMins: null });
});

test("validateEnergyOutput rejects invalid energyRequired", () => {
  expect(validateEnergyOutput('{"energyRequired":"extreme","estimatedMins":45}')).toBeNull();
});

test("validateEnergyOutput rejects non-enum estimatedMins — no coercion", () => {
  expect(validateEnergyOutput('{"energyRequired":"low","estimatedMins":30}')).toBeNull();
});

test("validateEnergyOutput rejects malformed JSON", () => {
  expect(validateEnergyOutput("not json")).toBeNull();
});

test("validateEnergyOutput rejects missing fields", () => {
  expect(validateEnergyOutput('{"energyRequired":"low"}')).toBeNull();
});

test("ENERGY_FALLBACK has medium energy and null mins", () => {
  expect(ENERGY_FALLBACK.energyRequired).toBe("medium");
  expect(ENERGY_FALLBACK.estimatedMins).toBeNull();
});

test("all valid estimatedMins values accepted", () => {
  for (const mins of [20, 45, 75, 120, 150]) {
    const result = validateEnergyOutput(`{"energyRequired":"medium","estimatedMins":${mins}}`);
    expect(result).not.toBeNull();
  }
});
