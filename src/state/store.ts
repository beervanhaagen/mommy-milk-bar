import { create } from "zustand";
import { nanoid } from "nanoid/non-secure";
import { DrinkState, DrinkEntry, DrinkSession } from '../types/drinks';
import { drinksReducer, initialState as drinksInitialState } from './drinksReducer';
import { Profile } from '../lib/alcohol';
import { storage, STORAGE_KEY } from '../lib/storage';

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

export type Settings = {
  weightKg?: number;
  heightCm?: number;
  motherBirthdate?: string; // ISO string van geboortedatum
  babyBirthdate?: string; // ISO string van geboortedatum
  babyWeightKg?: number;
  babyLengthCm?: number;
  feedingType?: 'breast' | 'formula' | 'mix';
  feedsPerDay?: number; // slider value 0-14 or unknown
  typicalAmountMl?: number;
  pumpPreference?: 'yes' | 'no' | 'later';
  motherName?: string | 'prefer_not_to_share';
  babyName?: string | 'prefer_not_to_share';
  safetyMode: 'normal' | 'cautious';
  notificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;
};

type Store = {
  sessions: AlcoholSession[];
  drinks: Drink[];
  drinkState: DrinkState;
  settings: Settings;
  createSession: (params: { drinks: number; startedAt: number; weightKg?: number; mode?: 'now' | 'backfill' | 'planAhead' }) => string;
  addDrink: (drink: Omit<Drink, 'id'>) => string;
  updateSettings: (settings: Partial<Settings>) => void;
  markCompleted: (sessionId: string) => void;
  // New drink management
  dispatchDrinkAction: (action: any) => void;
  getCurrentSession: () => DrinkSession | undefined;
  getProfile: () => Profile;
  // Persistence
  _hasHydrated: boolean;
  _setHasHydrated: (value: boolean) => void;
};

// State that should be persisted
type PersistedState = {
  sessions: AlcoholSession[];
  drinks: Drink[];
  drinkState: DrinkState;
  settings: Settings;
};

function calculateClearance(drinks: number, weightKg?: number): number {
  const baseHours = drinks * 2.5; // Conservative baseline
  const weightFactor = weightKg ? Math.max(0.8, 1 - (weightKg - 60) * 0.01) : 1;
  const safetyBuffer = 0.5; // Extra 30min buffer
  return baseHours * weightFactor + safetyBuffer;
}

// Load persisted state on startup
const loadPersistedState = async (): Promise<Partial<PersistedState>> => {
  try {
    const savedState = await storage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
  return {};
};

// Save state to storage
const saveState = (state: Store) => {
  const persistedState: PersistedState = {
    sessions: state.sessions,
    drinks: state.drinks,
    drinkState: state.drinkState,
    settings: state.settings,
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
};

export const useStore = create<Store>((set, get) => ({
  sessions: [],
  drinks: [],
  drinkState: drinksInitialState,
  settings: {
    heightCm: undefined,
    motherBirthdate: undefined,
    babyBirthdate: undefined,
    feedsPerDay: undefined,
    pumpPreference: undefined,
    safetyMode: 'normal',
    notificationsEnabled: true,
    hasCompletedOnboarding: false,
  },
  _hasHydrated: false,
  _setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),
  
  createSession: ({ drinks, startedAt, weightKg, mode = 'now' }) => {
    const id = nanoid();
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

    set(state => ({
      sessions: [newSession, ...state.sessions].slice(0, 5) // Keep last 5
    }));

    return id;
  },

  addDrink: (drinkData) => {
    const id = nanoid();
    const newDrink: Drink = {
      id,
      ...drinkData,
    };
    
    set(state => ({
      drinks: [newDrink, ...state.drinks].slice(0, 50) // Keep last 50 drinks
    }));
    
    return id;
  },
  
  updateSettings: (newSettings) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },
  
  markCompleted: (sessionId) => {
    set(state => ({
      sessions: state.sessions.map(session =>
        session.id === sessionId
          ? { ...session, completedAt: Date.now() }
          : session
      )
    }));
  },

  dispatchDrinkAction: (action) => {
    set(state => ({
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
      weightKg: state.settings.weightKg,
      stdDrinkGrams: 10, // NL/EU standard
      conservativeFactor: state.settings.safetyMode === 'cautious' ? 1.15 : 1.0,
    };
  },
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
  useStore.setState({
    ...persistedState,
    _hasHydrated: true,
  });
};
