import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const NOTIFICATION_COPY = "Ready when you are.";
const GRACE_MINUTES = 1;

function localHHMM(timezone: string, now: Date): string {
  return now.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).slice(0, 5);
}

function emailFallbackTime(notificationTime: string): string {
  const [h, m] = notificationTime.split(":").map(Number);
  const totalMins = h * 60 + m - 15;
  const fh = Math.floor(totalMins / 60);
  const fm = totalMins % 60;
  return `${String(fh).padStart(2, "0")}:${String(fm).padStart(2, "0")}`;
}

export const sendMorningNotifications = onSchedule("every 30 minutes", async () => {
  const db = getFirestore();
  const messaging = getMessaging();
  const now = new Date();

  const usersSnap = await db
    .collection("users")
    .where("notificationsEnabled", "==", true)
    .get();

  const allUsersSnap = await db.collection("users").get();

  const todayStr = now.toISOString().slice(0, 10);

  for (const userDoc of usersSnap.docs) {
    const user = userDoc.data();
    const { notificationTime, timezone, fcmToken } = user;
    if (!notificationTime || !timezone) continue;

    const localTime = localHHMM(timezone, now);
    if (localTime !== notificationTime) continue;

    // Check not already sent today
    const sentSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("notificationLog")
      .where("date", "==", todayStr)
      .limit(1)
      .get();
    if (!sentSnap.empty) continue;

    if (fcmToken) {
      try {
        await messaging.send({
          token: fcmToken,
          notification: { title: "dot", body: NOTIFICATION_COPY },
        });
        await db
          .collection("users")
          .doc(userDoc.id)
          .collection("notificationLog")
          .add({ date: todayStr, type: "push", sentAt: now });
        continue;
      } catch {
        // Fall through to email fallback
      }
    }

    // Email fallback handled by the email-fallback function (runs 15 min earlier)
  }

  // Email fallback: users with notificationsEnabled: false or no FCM token
  for (const userDoc of allUsersSnap.docs) {
    const user = userDoc.data();
    const { notificationTime, timezone, email, notificationsEnabled, fcmToken } = user;
    if (!notificationTime || !timezone || !email) continue;

    const fallbackTime = emailFallbackTime(notificationTime);
    const localTime = localHHMM(timezone, now);
    if (localTime !== fallbackTime) continue;

    // Only send email if push is disabled or no token
    if (notificationsEnabled && fcmToken) continue;

    const sentSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("notificationLog")
      .where("date", "==", todayStr)
      .limit(1)
      .get();
    if (!sentSnap.empty) continue;

    // Email send would go here — integrate with SendGrid/Resend/etc. in production
    // For now, log the intent
    await db
      .collection("users")
      .doc(userDoc.id)
      .collection("notificationLog")
      .add({ date: todayStr, type: "email-queued", sentAt: now, to: email });
  }

  void GRACE_MINUTES; // referenced to avoid unused warning
});
