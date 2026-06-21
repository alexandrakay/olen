"use server";

import Anthropic from "@anthropic-ai/sdk";
import { buildPickTextPrompt, validatePickText, fallbackPickText, dayOnePickText, type PickCandidateInput } from "@/lib/pick-text";

const client = new Anthropic();

export async function generatePickText(
  candidate: PickCandidateInput,
  bio: string,
  energyLevel: 1 | 2 | 3 | 4 | 5,
  timeAvailableMins: 20 | 45 | 75 | 120,
  completedDownloads: number,
  now: Date,
): Promise<{ text: string; promptVersion: string }> {
  if (completedDownloads === 0) {
    return { text: dayOnePickText(candidate), promptVersion: "pick-v1-day-one" };
  }

  try {
    const { systemPrompt, userMessage } = buildPickTextPrompt(
      candidate, bio, energyLevel, timeAvailableMins, now,
    );

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 128,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    if (!validatePickText(text)) {
      return { text: fallbackPickText(candidate, energyLevel, timeAvailableMins), promptVersion: "pick-v1-fallback" };
    }

    return { text, promptVersion: "pick-v1" };
  } catch {
    return { text: fallbackPickText(candidate, energyLevel, timeAvailableMins), promptVersion: "pick-v1-fallback" };
  }
}
