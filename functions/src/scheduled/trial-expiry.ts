import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

export const checkTrialExpiry = onSchedule("every 24 hours", async () => {
  const db = getFirestore();
  const now = Date.now();
  const cutoff = Timestamp.fromMillis(now - GRACE_PERIOD_MS);

  const snap = await db
    .collection("users")
    .where("subscriptionStatus", "==", "trial")
    .where("trialEndsAt", "<", cutoff)
    .get();

  if (snap.empty) return;

  const batch = db.batch();
  snap.docs.forEach((d) => {
    batch.update(d.ref, { subscriptionStatus: "expired" });
  });
  await batch.commit();
});
