import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useStore } from "../src/state/store";
import { useAuth } from "../src/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { loadProfileFromSupabase } from "../src/services/profile.service";

export default function Index() {
  const hasCompletedOnboarding = useStore((state) => state.profile.hasCompletedOnboarding);
  const { isAuthenticated, loading } = useAuth();

  // Sync data from Supabase on app startup for authenticated users
  useEffect(() => {
    if (isAuthenticated && hasCompletedOnboarding) {
      loadProfileFromSupabase().catch((err) => {
        console.warn('Failed to load profile from Supabase:', err);
        // Non-critical - local data still available
      });
    }
  }, [isAuthenticated, hasCompletedOnboarding]);

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

