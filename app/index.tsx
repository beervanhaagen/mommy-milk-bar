import { useEffect, useRef } from "react";
import { Redirect } from "expo-router";
import { useStore } from "../src/state/store";
import { useAuth } from "../src/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const hasCompletedOnboarding = useStore((state) => state.profile.hasCompletedOnboarding);
  const loadFromSupabase = useStore((state) => state.loadFromSupabase);
  const syncToSupabase = useStore((state) => state.syncToSupabase);
  const { isAuthenticated, loading } = useAuth();
  const hasSyncedOnce = useRef(false);

  // Sync data from Supabase on app startup for authenticated users
  useEffect(() => {
    if (isAuthenticated && hasCompletedOnboarding) {
      loadFromSupabase().catch((err) => {
        console.warn('Failed to load profile from Supabase:', err);
        // Non-critical - local data still available
      });
    }
  }, [isAuthenticated, hasCompletedOnboarding, loadFromSupabase]);

  useEffect(() => {
    if (isAuthenticated && hasCompletedOnboarding && !hasSyncedOnce.current) {
      hasSyncedOnce.current = true;
      syncToSupabase().catch((err) => {
        console.warn('Initial sync failed:', err);
      });
    }
  }, [isAuthenticated, hasCompletedOnboarding, syncToSupabase]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  // If authenticated and onboarding complete, go to app
  if (isAuthenticated && hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  // If authenticated but onboarding not complete, continue onboarding
  if (isAuthenticated && !hasCompletedOnboarding) {
    return <Redirect href="/onboarding/completion" />;
  }

  // Not authenticated - show landing page (they can start onboarding from there)
  return <Redirect href="/landing" />;
}

