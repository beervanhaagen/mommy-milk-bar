// lib/alcohol.ts - Improved alcohol clearance calculation based on LactMed nomogram
// Based on NIH/NLM LactMed, CDC, and ACOG guidelines

export interface Profile {
  weightKg?: number;                // Required for accuracy
  stdDrinkGrams: number;           // NL/EU = 10g; US = 14g
  conservativeFactor?: number;     // 1.0 = normal, 1.15 = +15% wait time
}

export interface DrinkEntry {
  id: string;
  typeId: string;
  glasses: number;                 // integer
  ts: number;                      // epoch ms
  unitsPerGlass: number;           // standard drinks per glass
  gramsPerUnit?: number;           // grams alcohol per unit (defaults to stdDrinkGrams)
}

// LactMed nomogram points: 54kg→2.5h, 68kg→2.25h, 82kg→2.0h
const HOURS_AT_54KG = 2.5;
const HOURS_AT_68KG = 2.25;
const HOURS_AT_82KG = 2.0;

/**
 * Calculate hours per standard drink based on weight (LactMed nomogram)
 * Conservative defaults for edge cases
 */
export function hoursPerStdDrink(weightKg?: number): number {
  if (!weightKg) return HOURS_AT_54KG;            // Conservative default
  if (weightKg <= 54) return 2.8;                 // Extra safe for <54kg
  if (weightKg >= 82) return HOURS_AT_82KG;
  
  // Linear interpolation 54→68→82
  if (weightKg <= 68) {
    const t = (weightKg - 54) / (68 - 54);
    return HOURS_AT_54KG + t * (HOURS_AT_68KG - HOURS_AT_54KG);
  } else {
    const t = (weightKg - 68) / (82 - 68);
    return HOURS_AT_68KG + t * (HOURS_AT_82KG - HOURS_AT_68KG);
  }
}

/**
 * Calculate standard drinks for an entry
 */
export function stdDrinks(entry: { glasses: number; unitsPerGlass: number; gramsPerUnit?: number }, profile: Profile): number {
  const gramsPerStd = profile.stdDrinkGrams;      // 10g NL/EU
  const grams = entry.glasses * entry.unitsPerGlass * (entry.gramsPerUnit ?? gramsPerStd);
  return grams / gramsPerStd;                     // in standard drinks
}

/**
 * Calculate remaining hours for a single drink entry
 */
export function remainingHoursForEntry(
  entry: { ts: number; glasses: number; unitsPerGlass: number },
  profile: Profile,
  now = Date.now()
): number {
  const perStd = hoursPerStdDrink(profile.weightKg) * (profile.conservativeFactor ?? 1.0);
  const totalH = stdDrinks(entry, profile) * perStd; // Total hours needed for this drink
  const elapsedH = Math.max(0, (now - entry.ts) / 3_600_000);
  return Math.max(0, totalH - elapsedH);
}

/**
 * Calculate total remaining time (sum of all entries - zero-order clearance)
 */
export function countdownMs(
  entries: Array<{ ts: number; glasses: number; unitsPerGlass: number }>, 
  profile: Profile, 
  now = Date.now()
): number {
  const hours = entries.reduce((acc, e) => acc + remainingHoursForEntry(e, profile, now), 0);
  return Math.round(hours * 3_600_000);
}

/**
 * Format milliseconds to HH:MM:SS
 */
export function formatHMS(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Calculate elapsed hours since timestamp
 */
export function elapsedHours(now: number, ts: number): number {
  return Math.max(0, (now - ts) / 3_600_000);
}

/**
 * Calculate progress for a drink entry (0-1)
 */
export function drinkProgress(
  entry: { ts: number; glasses: number; unitsPerGlass: number },
  profile: Profile,
  now = Date.now()
): number {
  const totalH = stdDrinks(entry, profile) * hoursPerStdDrink(profile.weightKg);
  const elapsedH = elapsedHours(now, entry.ts);
  return Math.min(1, elapsedH / totalH);
}

/**
 * Get last drink info from session
 */
export function lastDrinkInfo(session?: { entries: DrinkEntry[] }) {
  if (!session || session.entries.length === 0) return null;
  const last = [...session.entries].sort((a, b) => b.ts - a.ts)[0];
  const totalGlasses = session.entries.reduce((n, e) => n + e.glasses, 0);
  return { last, totalGlasses };
}

/**
 * Get total standard drinks in session
 */
export function totalStdDrinks(entries: DrinkEntry[], profile: Profile): number {
  return entries.reduce((acc, entry) => acc + stdDrinks(entry, profile), 0);
}

/**
 * Get today's entries (for daily totals)
 */
export function getTodayEntries(entries: DrinkEntry[]): DrinkEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
  
  return entries.filter(entry => entry.ts >= todayStart && entry.ts < tomorrowStart);
}
