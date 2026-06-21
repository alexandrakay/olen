import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";
import Anthropic from "@anthropic-ai/sdk";
import { buildEnergyPrompt, validateEnergyOutput, ENERGY_FALLBACK } from "../lib/energy-inference";

const client = new Anthropic();

async function callClaude(
  title: string,
  bio: string,
  contextLabel: string,
  contextDescription: string,
): Promise<string | null> {
  try {
    const { systemPrompt, userMessage } = buildEnergyPrompt(title, bio, contextLabel, contextDescription);
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 64,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    return msg.content[0].type === "text" ? msg.content[0].text.trim() : null;
  } catch {
    return null;
  }
}

export const inferTaskEnergy = onDocumentCreated(
  "users/{uid}/tasks/{taskId}",
  async (event) => {
    const db = getFirestore();
    const snap = event.data;
    if (!snap) return;

    const task = snap.data();
    const { uid, taskId } = event.params;

    // Skip if user already set energy manually
    if (task.energyOverridden === true) return;

    // Load user bio and context
    const [userSnap, ctxSnap] = await Promise.all([
      db.doc(`users/${uid}`).get(),
      db.doc(`users/${uid}/contexts/${task.contextId}`).get(),
    ]);

    const bio: string = userSnap.exists ? (userSnap.data()?.bio ?? "") : "";
    const contextLabel: string = ctxSnap.exists ? (ctxSnap.data()?.label ?? "") : "";
    const contextDescription: string = ctxSnap.exists ? (ctxSnap.data()?.description ?? "") : "";

    // First attempt
    let raw = await callClaude(task.title, bio, contextLabel, contextDescription);
    let result = raw ? validateEnergyOutput(raw) : null;

    // Single silent retry on failure
    if (!result) {
      raw = await callClaude(task.title, bio, contextLabel, contextDescription);
      result = raw ? validateEnergyOutput(raw) : null;
    }

    const final = result ?? ENERGY_FALLBACK;

    await db.doc(`users/${uid}/tasks/${taskId}`).update({
      energyRequired: final.energyRequired,
      estimatedMins: final.estimatedMins,
      promptVersion: "energy-v1",
    });
  },
);
