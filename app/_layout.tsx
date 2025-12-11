import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, LogBox } from "react-native";
import { hydrateStore } from "../src/state/store";
import { AuthProvider } from "../src/contexts/AuthContext";

// Ignore auth-related errors in development
// These are handled gracefully by our auth code
LogBox.ignoreLogs([
  'Invalid Refresh Token',
  'Refresh Token Not Found',
  'Auth session missing',
  'AuthSessionMissingError',
  'Failed to sync profile',
  'Failed to sync all data',
  'Sync error (non-critical)',
  'Sign in error',
  'Email not confirmed',
]);

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load persisted data on app startup
    hydrateStore().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    // Show loading screen while loading data
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="result" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="planning" />
        <Stack.Screen name="settings" />
      </Stack>
    </AuthProvider>
  );
}
