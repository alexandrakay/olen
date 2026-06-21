"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthLoading } from "@/components/auth-loading";
import { PaywallScreen } from "@/components/paywall-screen";
import { needsPaywall } from "@/lib/trial";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

export default function PaywallPage() {
  const { firebaseUser, userDoc, loading } = useAuth();
  const router = useRouter();
  const [completedDownloads, setCompletedDownloads] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !userDoc) { router.replace("/"); return; }
    // If they somehow land here but don't need paywall, send them home
    if (!needsPaywall(userDoc, new Date())) {
      router.replace("/today");
      return;
    }
    // Count completed download docs
    getCountFromServer(collection(db, `users/${firebaseUser.uid}/downloads`)).then((snap) => {
      setCompletedDownloads(snap.data().count);
    });
  }, [loading, firebaseUser, userDoc, router]);

  if (loading) return <AuthLoading />;
  if (!firebaseUser || !userDoc) return null;

  return (
    <PaywallScreen
      completedDownloads={completedDownloads}
      userEmail={userDoc.email}
      uid={firebaseUser.uid}
    />
  );
}
