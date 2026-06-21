"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthLoading } from "@/components/auth-loading";
import { SplashScreen } from "@/components/splash-screen";

export default function Home() {
  const { firebaseUser, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) return;
    if (!userDoc) return;

    if (!userDoc.onboardingComplete) {
      router.replace("/onboarding");
    } else {
      router.replace("/today");
    }
  }, [loading, firebaseUser, userDoc, router]);

  if (loading) return <AuthLoading />;
  if (!firebaseUser) return <SplashScreen />;
  return <AuthLoading />;
}
