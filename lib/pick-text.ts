export interface PickTextInput {
  type: "task" | "context";
  taskTitle: string | null;
  taskEstimatedMins: number | null;
  contextLabel: string;
  contextDescription: string;
  daysSinceLastFocused: number | null;
}

const ENERGY_LABELS: Record<number, string> = {
  1: "very low", 2: "low", 3: "steady", 4: "good", 5: "high",
};

const TIME_LABELS: Record<number, string> = {
  20: "about 20 minutes", 45: "30–60 minutes", 75: "1–2 hours", 120: "a couple hours",
};

export function buildPickTextPrompt(
  input: PickTextInput,
  bio: string,
  energyLevel: 1 | 2 | 3 | 4 | 5,
  timeAvailableMins: 20 | 45 | 75 | 120,
): { systemPrompt: string; userMessage: string } {
  const systemPrompt = `You are dot, an AI daily co-pilot. Write 1–2 sentences (max 200 chars total) about the task or context the user should focus on next.

Voice rules:
- Short sentences. No filler words.
- Never use: "excited", "solopreneur", em dashes, or "ADHD"
- Low energy is data, not failure. No guilt language.
- First person from dot's perspective, not a coach.
- For context picks: low-pressure, never imperative verbs. Acknowledge the gap without guilt.
- Max 2 sentences, ~200 chars. If you'd go longer, cut mercilessly.`;

  let userMessage: string;

  if (input.type === "task") {
    const timeNote = input.taskEstimatedMins ? ` Estimated: ${input.taskEstimatedMins} min.` : "";
    userMessage = `User bio: ${bio}
Energy level: ${ENERGY_LABELS[energyLevel]}
Time available: ${TIME_LABELS[timeAvailableMins]}
Pick type: task
Task title: ${input.taskTitle}
Context: ${input.contextLabel}${timeNote}

Write the pick text.`;
  } else {
    userMessage = `User bio: ${bio}
Energy level: ${ENERGY_LABELS[energyLevel]}
Time available: ${TIME_LABELS[timeAvailableMins]}
Pick type: context (no tasks in this area)
Context: ${input.contextLabel}
Context description: ${input.contextDescription}
Days since last focused: ${input.daysSinceLastFocused ?? "unknown"}

Write the pick text.`;
  }

  return { systemPrompt, userMessage };
}

export function validatePickText(text: string): boolean {
  if (text.length > 200) return false;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 2) return false;
  return true;
}

export function fallbackPickText(
  input: PickTextInput,
  energyLevel: 1 | 2 | 3 | 4 | 5,
  timeAvailableMins: 20 | 45 | 75 | 120,
): string {
  const timeLabel = TIME_LABELS[timeAvailableMins];
  const energyLabel = ENERGY_LABELS[energyLevel];
  const name = input.type === "task" ? input.taskTitle : input.contextLabel;
  return `You have ${timeLabel} and your energy is ${energyLabel}. ${name} is up next.`;
}

const DAY_ONE_TEXT = (contextLabel: string) =>
  `You're just getting started — dot picked ${contextLabel} because you named it first. Check in tonight and it'll start learning.`;

export function dayOnePickText(input: { contextLabel: string }): string {
  return DAY_ONE_TEXT(input.contextLabel);
}
