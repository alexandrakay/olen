"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/lib/types";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  userDoc: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userRef = doc(db, "users", fbUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUserDoc(snap.data() as User);
        } else {
          const createdAt = Timestamp.now();
          const trialEndsAt = Timestamp.fromMillis(
            createdAt.toMillis() + 14 * 24 * 60 * 60 * 1000
          );
          const newUser: User = {
            uid: fbUser.uid,
            email: fbUser.email ?? "",
            displayName: fbUser.displayName ?? "",
            bio: "",
            createdAt,
            onboardingCompletedAt: null,
            trialEndsAt,
            onboardingStep: 1,
            onboardingComplete: false,
            subscriptionStatus: "trial",
            stripeCustomerId: null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            schedulePriors: {
              morningWindow: "varies",
              chaoticDays: [],
              energyPeak: "unpredictable",
            },
            notificationsEnabled: false,
            notificationTime: "07:30",
            energyBaseline: 5,
          };
          await setDoc(userRef, newUser);
          setUserDoc(newUser);
        }
      } else {
        setUserDoc(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, userDoc, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
