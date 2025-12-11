/**
 * Data Export & Portability Functions
 *
 * Apple App Store & GDPR Compliance:
 * - Users must be able to export their data
 * - Data must be in a readable format (JSON)
 * - Must include all personal information
 */

import { Share, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { MotherProfile, Baby } from '../state/store';

export type ExportData = {
  version: string;
  exportDate: string;
  appName: string;
  userData: {
    profile: {
      weightKg?: number;
      email?: string;
    };
    baby: {
      babyName?: string;
      babyBirthdate?: string;
      babyAge?: string;
    };
    feeding: {
      feedingType?: string;
      feedsPerDay?: number;
      pumpPreference?: string;
      typicalAmountMl?: number;
    };
    preferences: {
      safetyMode?: string;
      notificationsEnabled?: boolean;
    };
  };
  disclaimer: string;
};

/**
 * Calculate age from birthdate
 */
const calculateAge = (birthdate?: string): number | undefined => {
  if (!birthdate) return undefined;

  const birth = new Date(birthdate);
  const today = new Date();
  const years = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  return years;
};

/**
 * Calculate baby age in readable format
 */
const calculateBabyAge = (birthdate?: string): string | undefined => {
  if (!birthdate) return undefined;

  const birth = new Date(birthdate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const months = Math.floor(diffDays / 30);
  const years = Math.floor(months / 12);

  if (years >= 1) {
    const remainingMonths = months - (years * 12);
    if (remainingMonths > 0) {
      return `${years} jaar, ${remainingMonths} maanden`;
    }
    return `${years} jaar`;
  } else if (months >= 1) {
    return `${months} maanden`;
  } else {
    return `${weeks} weken`;
  }
};

/**
 * Prepare user data for export
 */
export const prepareExportData = (profile: MotherProfile, baby?: Baby): ExportData => {
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    appName: 'Mommy Milk Bar',
    userData: {
      profile: {
        weightKg: profile.weightKg,
        email: profile.email,
      },
      baby: {
        babyName: baby?.name === 'prefer_not_to_share' ? undefined : baby?.name,
        babyBirthdate: baby?.birthdate,
        babyAge: calculateBabyAge(baby?.birthdate),
      },
      feeding: {
        feedingType: baby?.feedingType,
        feedsPerDay: baby?.feedsPerDay,
        pumpPreference: baby?.pumpPreference,
        typicalAmountMl: baby?.typicalAmountMl,
      },
      preferences: {
        safetyMode: profile.safetyMode,
        notificationsEnabled: profile.notificationsEnabled,
      },
    },
    disclaimer: 'Deze data behoort tot jou. Mommy Milk Bar deelt nooit je persoonlijke informatie met derden.',
  };
};

/**
 * Export user data as JSON file
 * Supports both iOS and Android
 */
export const exportUserData = async (profile: MotherProfile, baby?: Baby): Promise<void> => {
  try {
    const exportData = prepareExportData(profile, baby);
    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `mommy-milk-bar-export-${new Date().getTime()}.json`;

    if (Platform.OS === 'web') {
      // Web: download as file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      Alert.alert(
        'Data geëxporteerd',
        'Je data is gedownload als JSON bestand.',
        [{ text: 'OK' }]
      );
    } else {
      // iOS/Android: use share sheet
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Share.share({
        url: fileUri,
        message: 'Mijn Mommy Milk Bar data',
      });

      // Clean up the file after sharing
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(fileUri);
        } catch (error) {
          console.error('Error cleaning up export file:', error);
        }
      }, 5000);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    Alert.alert(
      'Export mislukt',
      'Er is iets misgegaan bij het exporteren van je data. Probeer het later opnieuw.',
      [{ text: 'OK' }]
    );
    throw error;
  }
};

/**
 * Delete all user data
 * Shows confirmation dialog before deletion
 */
export const deleteAllUserData = async (
  clearStore: () => void,
  resetProfile?: () => void,
  clearPersistedState?: () => Promise<void>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      'Account verwijderen',
      'Weet je zeker dat je al je data wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
          onPress: () => reject(new Error('User cancelled')),
        },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data from store and persistence
              clearStore();
              resetProfile?.();
              if (clearPersistedState) {
                await clearPersistedState();
              }

              Alert.alert(
                'Data verwijderd',
                'Al je data is succesvol verwijderd.',
                [{ text: 'OK' }]
              );

              resolve();
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert(
                'Verwijderen mislukt',
                'Er is iets misgegaan. Probeer het later opnieuw.',
                [{ text: 'OK' }]
              );
              reject(error);
            }
          },
        },
      ]
    );
  });
};
