import type { EnergyLevel, EstimatedMins } from "@/lib/types";

export interface EnergyInferenceResult {
  energyRequired: EnergyLevel;
  estimatedMins: EstimatedMins | null;
}

export const ENERGY_FALLBACK: EnergyInferenceResult = {
  energyRequired: "medium",
  estimatedMins: null,
};

const VALID_ENERGY: EnergyLevel[] = ["low", "medium", "high"];
const VALID_MINS: (EstimatedMins | null)[] = [20, 45, 75, 120, 150, null];

export function buildEnergyPrompt(
  title: string,
  bio: string,
  contextLabel: string,
  contextDescription: string,
): { systemPrompt: string; userMessage: string } {
  const systemPrompt = `You infer task energy and time for a personal productivity app.

Output only valid JSON. No preamble, no explanation, no markdown.
Schema: {"energyRequired":"low"|"medium"|"high","estimatedMins":20|45|75|120|150|null}

Rules:
- energyRequired: cognitive/emotional load. low=routine/admin, medium=focused work, high=complex/draining.
- estimatedMins: realistic wall-clock time. Use null if genuinely unclear.
- Only these exact estimatedMins values: 20, 45, 75, 120, 150, or null. Never round or interpolate.
- Short sentences. No filler. Low energy is data, not failure.`;

  const userMessage = `Task: ${title}
Context: ${contextLabel}${contextDescription ? ` — ${contextDescription}` : ""}
User bio: ${bio || "Not provided"}`;

  return { systemPrompt, userMessage };
}

export function validateEnergyOutput(raw: string): EnergyInferenceResult | null {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    if (!VALID_ENERGY.includes(parsed.energyRequired)) return null;
    if (!VALID_MINS.includes(parsed.estimatedMins)) return null;
    if (!("estimatedMins" in parsed)) return null;
    return {
      energyRequired: parsed.energyRequired as EnergyLevel,
      estimatedMins: parsed.estimatedMins as EstimatedMins | null,
    };
  } catch {
    return null;
  }
}
