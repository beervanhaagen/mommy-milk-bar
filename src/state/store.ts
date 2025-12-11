/**
 * Zustand Store - Restructured for Supabase Integration
 *
 * This version properly separates:
 * - Mother profile data (profiles table)
 * - Baby data (babies table)
 * - Drink sessions and drinks
 *
 * Supports:
 * - Multiple babies per mother
 * - Full consent tracking
 * - Supabase sync
 */

import { create } from "zustand";
import uuid from 'react-native-uuid';
import { DrinkState, DrinkEntry, DrinkSession } from '../types/drinks';
import { drinksReducer, initialState as drinksInitialState } from './drinksReducer';
import { Profile as AlcoholProfile } from '../lib/alcohol';
import { storage, STORAGE_KEY } from '../lib/storage';

// =====================================================
// MOTHER PROFILE TYPE
// =====================================================

export type MotherProfile = {
  // Supabase ID (from auth.users)
  id?: string;

  // Personal info
  weightKg?: number;
  email?: string;
  emailVerified?: boolean;

  // App settings
  safetyMode: 'normal' | 'cautious';
  notificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt?: string;

  // Consent tracking (GDPR compliance)
  consentVersion: string;
  ageConsent?: boolean;
  medicalDisclaimerConsent?: boolean;
  privacyPolicyConsent?: boolean;
  marketingConsent?: boolean;
  analyticsConsent?: boolean;
  consentTimestamp?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
};

// =====================================================
// BABY TYPE
// =====================================================

export type Baby = {
  // Supabase ID
  id: string;

  // Baby info
  name?: string | 'prefer_not_to_share';
  birthdate: string; // ISO date string (required)

  // Feeding preferences (per baby, not per mother!)
  feedingType?: 'breast' | 'formula' | 'mix';
  feedsPerDay?: number;
  typicalAmountMl?: number;
  pumpPreference?: 'yes' | 'no' | 'later';

  // Status
  isActive: boolean;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
};

// =====================================================
// LEGACY TYPES (for backward compatibility)
// =====================================================

export type AlcoholSession = {
  id: string;
  drinks: number;
  startedAt: number;
  weightKg?: number;
  mode: 'now' | 'backfill' | 'planAhead';
  predictedSafeAt: number;
  completedAt?: number;
};

export type Drink = {
  id: string;
  type: string;
  name: string;
  quantity: number;
  alcoholContent: number;
  standardDrinks: number;
  timestamp: string;
};

// =====================================================
// STORE TYPE
// =====================================================

type Store = {
  // User data (NEW STRUCTURE)
  profile: MotherProfile;
  babies: Baby[];
  activeBabyId?: string; // Which baby is currently selected

  // Drink tracking (existing)
  sessions: AlcoholSession[];
  drinks: Drink[];
  drinkState: DrinkState;

  // Profile actions
  updateProfile: (data: Partial<MotherProfile>) => void;
  setProfile: (profile: MotherProfile) => void;

  // Baby actions
  addBaby: (baby: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBaby: (id: string, data: Partial<Baby>) => void;
  deleteBaby: (id: string) => void;
  setActiveBaby: (id: string) => void;
  getActiveBaby: () => Baby | undefined;

  // Drink actions (existing, kept for compatibility)
  createSession: (params: {
    drinks: number;
    startedAt: number;
    weightKg?: number;
    mode?: 'now' | 'backfill' | 'planAhead'
  }) => string;
  addDrink: (drink: Omit<Drink, 'id'>) => string;
  markCompleted: (sessionId: string) => void;
  dispatchDrinkAction: (action: any) => void;
  getCurrentSession: () => DrinkSession | undefined;
  getProfile: () => AlcoholProfile;

  // Legacy (for backward compatibility - will be removed later)
  updateSettings: (settings: any) => void;
  resetProfile: () => void;
  clearPersistedState: () => Promise<void>;

  // Sync
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;

  // Persistence
  _hasHydrated: boolean;
  _setHasHydrated: (value: boolean) => void;
};

// =====================================================
// STATE MIGRATION
// =====================================================

/**
 * Migrates old Settings format to new Profile + Baby format
 */
function migrateOldSettings(oldSettings: any): { profile: MotherProfile; babies: Baby[] } {
  const profile: MotherProfile = {
    weightKg: oldSettings.weightKg,
    safetyMode: oldSettings.safetyMode || 'cautious',
    notificationsEnabled: oldSettings.notificationsEnabled ?? true,
    hasCompletedOnboarding: oldSettings.hasCompletedOnboarding ?? false,
    consentVersion: oldSettings.consentVersion || '1.0.0',
    ageConsent: oldSettings.ageConsent ?? false,
    medicalDisclaimerConsent: oldSettings.medicalDisclaimerConsent ?? false,
    privacyPolicyConsent: oldSettings.privacyPolicyConsent ?? false,
    marketingConsent: oldSettings.marketingConsent ?? false,
    analyticsConsent: oldSettings.analyticsConsent ?? false,
    consentTimestamp: oldSettings.consentTimestamp,
  };

  // If there's baby data in old settings, create a baby
  const babies: Baby[] = [];
  if (oldSettings.babyBirthdate) {
    babies.push({
      id: uuid.v4() as string,
      name: oldSettings.babyName,
      birthdate: oldSettings.babyBirthdate,
      feedingType: oldSettings.feedingType,
      feedsPerDay: oldSettings.feedsPerDay,
      typicalAmountMl: oldSettings.typicalAmountMl,
      pumpPreference: oldSettings.pumpPreference,
      isActive: true,
    });
  }

  return { profile, babies };
}

// =====================================================
// PERSISTED STATE
// =====================================================

type PersistedState = {
  profile: MotherProfile;
  babies: Baby[];
  activeBabyId?: string;
  sessions: AlcoholSession[];
  drinks: Drink[];
  drinkState: DrinkState;

  // Legacy field (for migration detection)
  settings?: any;
};

/**
 * Clean up deleted fields from persisted data
 * Removes fields that were removed in migrations 007/008
 */
const cleanupDeletedFields = (data: any): any => {
  if (data.profile) {
    const { motherName, motherBirthdate, heightCm, ...cleanProfile } = data.profile;
    data.profile = cleanProfile;
  }

  if (data.babies && Array.isArray(data.babies)) {
    data.babies = data.babies.map((baby: any) => {
      const { weightKg, lengthCm, ...cleanBaby } = baby;
      return cleanBaby;
    });
  }

  return data;
};

// Load persisted state on startup
const loadPersistedState = async (): Promise<Partial<PersistedState>> => {
  try {
    const savedState = await storage.getItem(STORAGE_KEY);
    if (savedState) {
      let parsed = JSON.parse(savedState);

      // Migration: if old Settings format is detected, migrate it
      if (parsed.settings && !parsed.profile) {
        const { profile, babies } = migrateOldSettings(parsed.settings);
        parsed = {
          ...parsed,
          profile,
          babies,
          activeBabyId: babies[0]?.id,
          settings: undefined, // Remove old settings
        };
      }

      // Clean up deleted fields from migrations 007/008
      parsed = cleanupDeletedFields(parsed);

      return parsed;
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
  return {};
};

// Save state to storage
const saveState = (state: Store) => {
  const persistedState: PersistedState = {
    profile: state.profile,
    babies: state.babies,
    activeBabyId: state.activeBabyId,
    sessions: state.sessions,
    drinks: state.drinks,
    drinkState: state.drinkState,
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// DEPRECATED: Use hoursPerStdDrink from src/lib/alcohol.ts instead
// This function is kept for backwards compatibility with old sessions only
function calculateClearance(drinks: number, weightKg?: number): number {
  // Use the precise LactMed nomogram model
  const { hoursPerStdDrink } = require('../lib/alcohol');
  const hoursPerDrink = hoursPerStdDrink(weightKg);
  return drinks * hoursPerDrink;
}

// =====================================================
// STORE IMPLEMENTATION
// =====================================================

export const useStore = create<Store>((set, get) => ({
  // Initial state
  profile: {
    safetyMode: 'cautious',
    notificationsEnabled: true,
    hasCompletedOnboarding: false,
    consentVersion: '1.0.0',
    ageConsent: false,
    medicalDisclaimerConsent: false,
    privacyPolicyConsent: false,
    marketingConsent: false,
    analyticsConsent: false,
  },
  babies: [],
  activeBabyId: undefined,
  sessions: [],
  drinks: [],
  drinkState: drinksInitialState,
  _hasHydrated: false,

  // Profile actions
  updateProfile: (data) => {
    set((state) => ({
      profile: { ...state.profile, ...data, updatedAt: new Date().toISOString() }
    }));
  },

  setProfile: (profile) => {
    set({ profile });
  },

  // Baby actions
  addBaby: (babyData) => {
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    const newBaby: Baby = {
      ...babyData,
      id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      babies: [...state.babies, newBaby],
      // If this is the first baby, make it active
      activeBabyId: state.babies.length === 0 ? id : state.activeBabyId,
    }));

    return id;
  },

  updateBaby: (id, data) => {
    set((state) => ({
      babies: state.babies.map((baby) =>
        baby.id === id
          ? { ...baby, ...data, updatedAt: new Date().toISOString() }
          : baby
      ),
    }));
  },

  deleteBaby: (id) => {
    set((state) => {
      const remainingBabies = state.babies.filter((b) => b.id !== id);
      return {
        babies: remainingBabies,
        // If deleting active baby, switch to first remaining
        activeBabyId: state.activeBabyId === id
          ? remainingBabies[0]?.id
          : state.activeBabyId,
      };
    });
  },

  setActiveBaby: (id) => {
    set({ activeBabyId: id });
  },

  getActiveBaby: () => {
    const state = get();
    return state.babies.find((b) => b.id === state.activeBabyId);
  },

  // Legacy settings update (for backward compatibility)
  updateSettings: (settingsData) => {
    const state = get();

    // Map old settings keys to new structure
    const profileUpdates: Partial<MotherProfile> = {};
    const babyUpdates: Partial<Baby> = {};

    // Mother-related fields
    if ('weightKg' in settingsData) profileUpdates.weightKg = settingsData.weightKg;
    if ('safetyMode' in settingsData) profileUpdates.safetyMode = settingsData.safetyMode;
    if ('notificationsEnabled' in settingsData) profileUpdates.notificationsEnabled = settingsData.notificationsEnabled;
    if ('hasCompletedOnboarding' in settingsData) profileUpdates.hasCompletedOnboarding = settingsData.hasCompletedOnboarding;
    if ('consentVersion' in settingsData) profileUpdates.consentVersion = settingsData.consentVersion;
    if ('consentTimestamp' in settingsData) profileUpdates.consentTimestamp = settingsData.consentTimestamp;
    (['ageConsent', 'medicalDisclaimerConsent', 'privacyPolicyConsent', 'marketingConsent', 'analyticsConsent'] as Array<keyof MotherProfile>).forEach((key) => {
      if (key in settingsData) {
        // @ts-expect-error - dynamic assignment
        profileUpdates[key] = settingsData[key];
      }
    });

    // Baby-related fields
    if ('babyName' in settingsData) babyUpdates.name = settingsData.babyName;
    if ('babyBirthdate' in settingsData) babyUpdates.birthdate = settingsData.babyBirthdate;
    if ('feedingType' in settingsData) babyUpdates.feedingType = settingsData.feedingType;
    if ('feedsPerDay' in settingsData) babyUpdates.feedsPerDay = settingsData.feedsPerDay;
    if ('typicalAmountMl' in settingsData) babyUpdates.typicalAmountMl = settingsData.typicalAmountMl;
    if ('pumpPreference' in settingsData) babyUpdates.pumpPreference = settingsData.pumpPreference;

    // Update profile
    if (Object.keys(profileUpdates).length > 0) {
      get().updateProfile(profileUpdates);
    }

    // Update or create baby
    if (Object.keys(babyUpdates).length > 0) {
      const activeBaby = get().getActiveBaby();
      if (activeBaby) {
        get().updateBaby(activeBaby.id, babyUpdates);
      } else if (babyUpdates.birthdate) {
        // If no active baby but we have a birthdate, create one
        get().addBaby({
          birthdate: babyUpdates.birthdate,
          ...babyUpdates,
          isActive: true,
        } as any);
      }
    }
  },

  resetProfile: () => {
    set({
      profile: {
        safetyMode: 'cautious',
        notificationsEnabled: true,
        hasCompletedOnboarding: false,
        consentVersion: '1.0.0',
        ageConsent: false,
        medicalDisclaimerConsent: false,
        privacyPolicyConsent: false,
        marketingConsent: false,
        analyticsConsent: false,
      },
      babies: [],
      activeBabyId: undefined,
      sessions: [],
      drinks: [],
      drinkState: drinksInitialState,
    });
  },

  clearPersistedState: async () => {
    await storage.removeItem(STORAGE_KEY);
  },

  // Drink actions (existing functionality)
  createSession: ({ drinks, startedAt, weightKg, mode = 'now' }) => {
    const id = uuid.v4() as string;
    const hours = calculateClearance(drinks, weightKg);
    const predictedSafeAt = startedAt + hours * 60 * 60 * 1000;

    const newSession: AlcoholSession = {
      id,
      drinks,
      startedAt,
      weightKg,
      mode,
      predictedSafeAt,
    };

    set((state) => ({
      sessions: [newSession, ...state.sessions].slice(0, 5) // Keep last 5
    }));

    return id;
  },

  addDrink: (drinkData) => {
    const id = uuid.v4() as string;
    const newDrink: Drink = {
      id,
      ...drinkData,
    };

    set((state) => ({
      drinks: [newDrink, ...state.drinks].slice(0, 50) // Keep last 50 drinks
    }));

    return id;
  },

  markCompleted: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, completedAt: Date.now() }
          : session
      )
    }));
  },

  dispatchDrinkAction: (action) => {
    set((state) => ({
      drinkState: drinksReducer(state.drinkState, action)
    }));
  },

  getCurrentSession: () => {
    const state = get();
    const activeId = state.drinkState.activeSessionId;
    return activeId ? state.drinkState.sessions[activeId] : undefined;
  },

  getProfile: () => {
    const state = get();
    return {
      weightKg: state.profile.weightKg,
      stdDrinkGrams: 10, // NL/EU standard
      // Cautious-mode adds an extra 10% buffer on top of LactMed
      conservativeFactor: state.profile.safetyMode === 'cautious' ? 1.10 : 1.0,
    };
  },

  // Sync methods
  syncToSupabase: async () => {
    try {
      const state = get();

      // Check if user is authenticated before syncing
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Skipping sync - user not authenticated');
        return;
      }

      const { syncAllDataToSupabase } = await import('../services/profile.service');
      await syncAllDataToSupabase(state.profile, state.babies);
    } catch (error: any) {
      console.error('Sync error (non-critical):', error);
      // Don't throw - syncing is non-critical
    }
  },

  loadFromSupabase: async () => {
    try {
      // Check if user is authenticated before loading
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Skipping load - user not authenticated');
        return;
      }

      const { loadProfileFromSupabase } = await import('../services/profile.service');
      const { profile, babies } = await loadProfileFromSupabase();

      if (profile) {
        set({
          profile,
          babies,
          activeBabyId: babies[0]?.id,
        });
      }
    } catch (error: any) {
      console.error('Failed to load from Supabase:', error);
      throw error;
    }
  },

  _setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),
}));

// Subscribe to state changes and save to storage
useStore.subscribe((state) => {
  // Only save after hydration is complete to avoid overwriting with initial state
  if (state._hasHydrated) {
    saveState(state);
  }
});

// Hydrate store from storage on app start
export const hydrateStore = async () => {
  const persistedState = await loadPersistedState();
  const currentProfile = useStore.getState().profile;

  const hydratedProfile: MotherProfile = persistedState.profile
    ? {
        ...currentProfile,
        ...persistedState.profile,
        safetyMode: persistedState.profile.safetyMode || 'cautious',
        consentVersion: persistedState.profile.consentVersion || '1.0.0',
        ageConsent: persistedState.profile.ageConsent ?? false,
        medicalDisclaimerConsent: persistedState.profile.medicalDisclaimerConsent ?? false,
        privacyPolicyConsent: persistedState.profile.privacyPolicyConsent ?? false,
        marketingConsent: persistedState.profile.marketingConsent ?? false,
        analyticsConsent: persistedState.profile.analyticsConsent ?? false,
      }
    : currentProfile;

  useStore.setState({
    ...persistedState,
    profile: hydratedProfile,
    _hasHydrated: true,
  });
};

// Export a getter for compatibility with code that accesses settings
export const getSettings = () => {
  const state = useStore.getState();
  const activeBaby = state.getActiveBaby();

  // Return a merged view for backward compatibility
  return {
    // Mother fields
    weightKg: state.profile.weightKg,

    // Baby fields (from active baby)
    babyName: activeBaby?.name,
    babyBirthdate: activeBaby?.birthdate,
    feedingType: activeBaby?.feedingType,
    feedsPerDay: activeBaby?.feedsPerDay,
    typicalAmountMl: activeBaby?.typicalAmountMl,
    pumpPreference: activeBaby?.pumpPreference,

    // App settings
    safetyMode: state.profile.safetyMode,
    notificationsEnabled: state.profile.notificationsEnabled,
    hasCompletedOnboarding: state.profile.hasCompletedOnboarding,
  };
};
