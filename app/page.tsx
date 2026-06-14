"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SplashScreen } from "@/components/splash-screen";
import { AuthLoading } from "@/components/auth-loading";

export default function Home() {
  const { firebaseUser, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !firebaseUser) return;

    if (!userDoc?.onboardingComplete) {
      router.replace("/onboarding");
    } else {
      // app state routing — built in later sprints
      router.replace("/app");
    }
  }, [loading, firebaseUser, userDoc, router]);

  if (loading) return <AuthLoading />;
  if (!firebaseUser) return <SplashScreen />;
  return <AuthLoading />; // holds screen while redirect resolves
}
