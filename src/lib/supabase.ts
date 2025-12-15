/**
 * Supabase Client Configuration
 *
 * This module initializes the Supabase client with proper auth persistence
 * for React Native using expo-secure-store.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// CRITICAL: Use fallback values instead of throwing during module initialization
// to prevent native crashes on TestFlight. The app will handle missing credentials
// gracefully at runtime.
//
// Try multiple sources in order of preference:
// 1. process.env (works in development with .env file)
// 2. Constants.expoConfig.extra (works in production builds via app.config.js)
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  '';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Auth features will be disabled.');
  console.warn('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.');
}

/**
 * Custom storage adapter using expo-secure-store
 * This ensures auth tokens are stored securely on device
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      // Fallback to localStorage on web
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * Supabase client instance
 * Configured with:
 * - Secure auth storage (expo-secure-store)
 * - Auto token refresh
 * - Persistent sessions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for React Native
  },
});

// Suppress console errors for auth issues that are handled gracefully
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const errorMessage = args[0]?.toString() || '';

  // Suppress specific auth errors that are handled gracefully by our code
  if (
    errorMessage.includes('Invalid Refresh Token') ||
    errorMessage.includes('Refresh Token Not Found') ||
    errorMessage.includes('Auth session missing') ||
    errorMessage.includes('AuthSessionMissingError') ||
    errorMessage.includes('Failed to sync profile') ||
    errorMessage.includes('Failed to sync all data') ||
    errorMessage.includes('Sync error (non-critical)') ||
    errorMessage.includes('Sign in error') ||
    errorMessage.includes('Email not confirmed')
  ) {
    // These errors are handled by the UI with user-friendly messages
    return;
  }

  // Pass through all other errors
  originalConsoleError(...args);
};

/**
 * Helper to check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};

/**
 * Helper to get current user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Helper to sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
