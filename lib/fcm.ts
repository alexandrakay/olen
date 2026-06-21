import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getApps, getApp } from "firebase/app";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function requestAndStoreFCMToken(uid: string): Promise<void> {
  try {
    const supported = await isSupported();
    if (!supported) return;

    const app = getApps().length > 0 ? getApp() : null;
    if (!app) return;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js"),
    });

    if (token) {
      await updateDoc(doc(db, `users/${uid}`), { fcmToken: token });
    }
  } catch {
    // Permission denied or not supported — silently skip
  }
}
