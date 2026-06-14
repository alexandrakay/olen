"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function joinWaitlist(email: string): Promise<{ success: boolean }> {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed || !trimmed.includes("@")) {
    return { success: false };
  }

  try {
    await adminDb.collection("waitlist").doc(trimmed).set({
      email: trimmed,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
