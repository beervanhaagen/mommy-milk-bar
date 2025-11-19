import { Redirect } from "expo-router";
import { useStore } from "../src/state/store";
import { useAuth } from "../src/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { settings } = useStore();
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  // If authenticated and onboarding complete, go to app
  if (isAuthenticated && settings.hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  // If authenticated but onboarding not complete, continue onboarding
  if (isAuthenticated && !settings.hasCompletedOnboarding) {
    return <Redirect href="/onboarding/completion" />;
  }

  // Not authenticated - show landing page (they can start onboarding from there)
  return <Redirect href="/landing" />;
}

