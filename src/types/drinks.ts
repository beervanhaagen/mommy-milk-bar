// types/drinks.ts - Drink types and session management
import React from 'react';

export type DrinkKind = 'wine' | 'beer' | 'spirits' | 'cocktail' | 'other';

export interface DrinkType {
  id: DrinkKind;
  label: string;
  abv: number;                 // % alcohol (informational)
  unitsPerGlass: number;      // standard drinks per glass
  gramsPerUnit: number;        // grams alcohol per unit
  standardVolumeMl: number;    // standard volume in ml used in calculations
  volumeInfo: string;          // user-friendly explanation of volume
  icon: React.ComponentType<{ size?: number; color?: string }>;
  isCustom?: boolean;         // Flag for custom drinks
}

export interface DrinkEntry {
  id: string;
  typeId: DrinkKind;
  glasses: number;             // integer
  ts: number;                  // epoch ms
  unitsPerGlass: number;       // standard drinks per glass
  gramsPerUnit?: number;       // grams alcohol per unit
}

export interface DrinkSession {
  id: string;
  startedAt: number;           // epoch ms
  endedAt?: number;
  entries: DrinkEntry[];
}

export interface DrinkState {
  activeSessionId?: string;
  sessions: Record<string, DrinkSession>;
}
