/**
 * Secure Storage for Sensitive Personal Data
 *
 * Apple App Store compliance requires:
 * - Encryption for sensitive health data (birthdates, weights, names)
 * - Secure storage practices
 * - Data portability
 *
 * This module wraps expo-secure-store for iOS/Android encryption
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SECURE_STORAGE_PREFIX = '@mmb-secure:';

export type SensitiveData = {
  motherBirthdate?: string;
  motherName?: string;
  babyBirthdate?: string;
  babyName?: string;
  weightKg?: number;
  heightCm?: number;
  babyWeightKg?: number;
  babyLengthCm?: number;
};

/**
 * Save sensitive data securely
 * iOS: Uses Keychain
 * Android: Uses EncryptedSharedPreferences
 */
export const saveSensitiveData = async (data: SensitiveData): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data);

    if (Platform.OS === 'web') {
      // Fallback for web: use localStorage with warning
      console.warn('Secure storage not available on web, using localStorage');
      localStorage.setItem(`${SECURE_STORAGE_PREFIX}sensitive`, jsonString);
    } else {
      // iOS/Android: use expo-secure-store
      await SecureStore.setItemAsync(`${SECURE_STORAGE_PREFIX}sensitive`, jsonString);
    }
  } catch (error) {
    console.error('Error saving sensitive data:', error);
    throw error;
  }
};

/**
 * Load sensitive data from secure storage
 */
export const loadSensitiveData = async (): Promise<SensitiveData | null> => {
  try {
    let jsonString: string | null = null;

    if (Platform.OS === 'web') {
      jsonString = localStorage.getItem(`${SECURE_STORAGE_PREFIX}sensitive`);
    } else {
      jsonString = await SecureStore.getItemAsync(`${SECURE_STORAGE_PREFIX}sensitive`);
    }

    if (!jsonString) return null;

    return JSON.parse(jsonString) as SensitiveData;
  } catch (error) {
    console.error('Error loading sensitive data:', error);
    return null;
  }
};

/**
 * Delete all sensitive data (for account deletion)
 */
export const deleteSensitiveData = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(`${SECURE_STORAGE_PREFIX}sensitive`);
    } else {
      await SecureStore.deleteItemAsync(`${SECURE_STORAGE_PREFIX}sensitive`);
    }
  } catch (error) {
    console.error('Error deleting sensitive data:', error);
    throw error;
  }
};

/**
 * Export all user data for GDPR/App Store compliance
 * Returns JSON string of all user data
 */
export const exportUserData = async (): Promise<string> => {
  try {
    const sensitiveData = await loadSensitiveData();

    // Combine with non-sensitive data from AsyncStorage if needed
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      userData: sensitiveData,
      disclaimer: 'This data belongs to you. Mommy Milk Bar never shares your personal information.',
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};
