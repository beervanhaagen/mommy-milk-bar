// components/CountdownCard.tsx - Main countdown display
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrinkSession } from '../types/drinks';
import { DrinkType } from '../types/drinks';
import { countdownMs, formatHMS, lastDrinkInfo, Profile } from '../lib/alcohol';

interface CountdownCardProps {
  session?: DrinkSession;
  drinkTypes: Record<string, DrinkType>;
  profile: Profile;
  activePlanningSafeTime?: number | null;
  safetyMarginMin?: number;
  onSafetyMarginChange?: (minutes: number) => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  session,
  drinkTypes,
  profile,
  activePlanningSafeTime,
  safetyMarginMin: safetyMarginProp,
  onSafetyMarginChange,
}) => {
  const [now, setNow] = useState(Date.now());
  const [internalSafetyMarginMin, setInternalSafetyMarginMin] = useState<number>(0);

  const safetyMarginMin = typeof safetyMarginProp === 'number' ? safetyMarginProp : internalSafetyMarginMin;
  const updateSafetyMargin = onSafetyMarginChange ?? setInternalSafetyMarginMin;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const baseMs = countdownMs(session?.entries || [], profile, now);
  const ms = baseMs + (safetyMarginMin * 60 * 1000);
  const statusSafe = ms <= 0;
  const info = lastDrinkInfo(session);
  const hasDrinks = session?.entries && session.entries.length > 0;

  // Check if we should show planning countdown instead
  const planningMsRaw = activePlanningSafeTime ? activePlanningSafeTime - now : null;
  const planningMs = planningMsRaw !== null ? Math.max(planningMsRaw, 0) : null;
  const planningMsWithMargin = planningMs !== null ? planningMs + (safetyMarginMin * 60 * 1000) : null;
  const isShowingPlanning = planningMsWithMargin !== null && planningMsWithMargin > 0;
  const shouldShowSafetyMarginButtons =
    (isShowingPlanning && planningMsWithMargin !== null) ||
    (!isShowingPlanning && !statusSafe && hasDrinks);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isShowingPlanning
          ? 'Je kunt veilig voeden over'
          : !session
            ? 'Nog geen drankje gelogd vandaag, je kunt veilig voeden'
            : !hasDrinks || statusSafe
              ? 'Je kunt nu veilig voeden'
              : 'Je kunt veilig voeden over'
        }
      </Text>
      {isShowingPlanning && <Text style={styles.timer}>{formatHMS(planningMsWithMargin!)}</Text>}
      {!isShowingPlanning && !statusSafe && hasDrinks && <Text style={styles.timer}>{formatHMS(ms)}</Text>}

      {/* Safety margin buttons - alleen tonen als er een actieve countdown is */}
      {shouldShowSafetyMarginButtons && (
        <View style={styles.safetyMarginButtons}>
          <TouchableOpacity
            style={[styles.marginButton, safetyMarginMin === 0 && styles.marginButtonActive]}
            onPress={() => updateSafetyMargin(0)}
          >
            <Text style={[styles.marginButtonText, safetyMarginMin === 0 && styles.marginButtonTextActive]}>
              Standaard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.marginButton, safetyMarginMin === 15 && styles.marginButtonActive]}
            onPress={() => updateSafetyMargin(15)}
          >
            <Text style={[styles.marginButtonText, safetyMarginMin === 15 && styles.marginButtonTextActive]}>
              +15 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.marginButton, safetyMarginMin === 30 && styles.marginButtonActive]}
            onPress={() => updateSafetyMargin(30)}
          >
            <Text style={[styles.marginButtonText, safetyMarginMin === 30 && styles.marginButtonTextActive]}>
              +30 min
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isShowingPlanning && info && (
        <>
          <Text style={styles.meta}>
            Laatste drankje: {new Date(info.last.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' '}({info.last.glasses} glas{info.last.glasses > 1 ? 'en' : ''})
          </Text>
          {!statusSafe && hasDrinks && (
            <Text style={styles.meta}>
              Veilig voeden om {new Date(now + ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
          <Text style={styles.meta}>Totaal vandaag: {info.totalGlasses} glas{info.totalGlasses !== 1 ? 'en' : ''}</Text>
        </>
      )}
      {isShowingPlanning && (
        <Text style={styles.meta}>
          Planning actief - Volg je geplande drankschema hieronder
        </Text>
      )}
      {profile.weightKg && (
        <Text style={styles.hint}>
          Dit is een indicatie gebaseerd op je gewicht ({profile.weightKg}kg) en {profile.stdDrinkGrams}g per standaarddrank. Raadpleeg bij twijfel een professional.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F49B9B',
    borderRadius: 24,
    padding: 24,
    marginBottom: 6,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 0,
  },
  timer: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 2,
    letterSpacing: 2,
  },
  safetyMarginButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  marginButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  marginButtonActive: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  marginButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 11,
    color: '#FFFFFF',
  },
  marginButtonTextActive: {
    color: '#F49B9B',
  },
  meta: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#FDE8E4',
    textAlign: 'center',
    marginBottom: 4,
  },
  hint: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 16,
    color: '#FDE8E4',
    textAlign: 'center',
    marginTop: 8,
  },
});
