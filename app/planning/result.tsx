import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DrinkPlan } from '../../src/types/planning';
import { hoursPerStdDrink } from '../../src/lib/alcohol';
import { useStore } from '../../src/state/store';

// Helper function to format time
const formatTime = (date: Date | undefined) => {
  if (!date) return '--:--';
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
};

export default function PlanResultScreen() {
  const router = useRouter();
  const { planData } = useLocalSearchParams();
  const { getProfile } = useStore();
  const profile = getProfile();
  const [plan, setPlan] = useState<Partial<DrinkPlan>>({});
  const [extraDrinks, setExtraDrinks] = useState(0);
  const [result, setResult] = useState<{
    safeFeedAt: Date;
    advice: any;
  } | null>(null);

  useEffect(() => {
    if (planData) {
      try {
        const parsedPlan = JSON.parse(planData as string);
        setPlan(parsedPlan);
        calculateResult(parsedPlan, 0);
      } catch (error) {
        console.error('Error parsing plan data:', error);
      }
    }
  }, [planData]);

  const calculateResult = (planData: Partial<DrinkPlan>, extra: number) => {
    if (!planData.startAt || !planData.drinks || !planData.pace) return;

    const fullPlan: DrinkPlan = {
      startAt: planData.startAt,
      drinks: planData.drinks + extra,
      pace: planData.pace,
      drinkType: planData.drinkType || 'WINE',
      prePump: planData.prePump || false,
      targetVolumeMl: planData.targetVolumeMl,
      freezerStockMl: planData.freezerStockMl,
      safetyBufferMin: planData.safetyBufferMin || 30,
      goal: planData.goal || 'MAX_RELAX',
      canPreFeed: planData.canPreFeed || false,
      canMicroPump: planData.canMicroPump || false,
      microPumpTargetMl: planData.microPumpTargetMl
    };

    // Use precise LactMed nomogram calculation based on user's weight
    const hoursPerDrink = hoursPerStdDrink(profile.weightKg) * (profile.conservativeFactor ?? 1.0);
    const totalHours = fullPlan.drinks * hoursPerDrink;
    const safeFeedAt = new Date(fullPlan.startAt.getTime() + totalHours * 60 * 60 * 1000);
    const advice = { tips: ['Drink water tussen de drankjes door', 'Eet iets voor je begint'] };

    setResult({ safeFeedAt, advice });
  };

  const handleExtraDrinksChange = (value: number) => {
    setExtraDrinks(value);
    calculateResult(plan, value);
  };

  const handleConfirmPlan = () => {
    // TODO: Save plan and create notifications
    router.push('/(tabs)');
  };

  const handleSharePlan = () => {
    // TODO: Implement sharing functionality
    console.log('Share plan');
  };

  if (!result || !plan.startAt) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Berekenen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate when drinking window ends
  const paceMinutes = plan.pace === 'ONE_HOUR' ? 60 : plan.pace === 'TWO_HOURS' ? 120 : 180;
  const totalDrinkingMinutes = ((plan.drinks || 1) - 1) * paceMinutes;
  const windowEnd = plan.startAt ? new Date(plan.startAt.getTime() + totalDrinkingMinutes * 60 * 1000) : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Je planning</Text>
          <Text style={styles.subtitle}>Hier is je persoonlijke tijdlijn</Text>
        </View>

        {/* Safe Feed Badge */}
        <View style={styles.safeFeedBadge}>
          <Text style={styles.safeFeedTitle}>Veilig voeden vanaf</Text>
          <Text style={styles.safeFeedTime}>{formatTime(result.safeFeedAt)}</Text>
          <Text style={styles.safeFeedDate}>
            {result.safeFeedAt.toLocaleDateString('nl-NL', { 
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionLabel}>Tijdlijn</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{formatTime(plan.startAt)}</Text>
                <Text style={styles.timelineLabel}>Start drinken</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{formatTime(windowEnd)}</Text>
                <Text style={styles.timelineLabel}>Laatste glas</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotSafe]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{formatTime(result.safeFeedAt)}</Text>
                <Text style={styles.timelineLabel}>Veilig voeden</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Scenario Slider */}
        <View style={styles.scenarioSection}>
          <Text style={styles.sectionLabel}>Wat als je +1 drankje neemt?</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Extra drankjes: {extraDrinks}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={3}
              step={1}
              value={extraDrinks}
              onValueChange={handleExtraDrinksChange}
              minimumTrackTintColor="#7A9DE8"
              maximumTrackTintColor="#D9D9D9"
              thumbTintColor="#7A9DE8"
            />
            <Text style={styles.sliderResult}>
              Veilig voeden vanaf: {formatTime(result.safeFeedAt)}
            </Text>
          </View>
        </View>

        {/* Action Advice */}
        <View style={styles.adviceSection}>
          <Text style={styles.sectionLabel}>Aanbevelingen</Text>
          <View style={styles.adviceCard}>
            {result.advice.preFeedAt && (
              <View style={styles.adviceItem}>
                <Text style={styles.adviceIcon}>🍼</Text>
                <Text style={styles.adviceText}>
                  Voed rond {formatTime(result.advice.preFeedAt)} vóór je eerste drankje
                </Text>
              </View>
            )}
            
            {result.advice.prePumpAt && (
              <View style={styles.adviceItem}>
                <Text style={styles.adviceIcon}>🤱</Text>
                <Text style={styles.adviceText}>
                  Begin met kolven om {formatTime(result.advice.prePumpAt)}
                </Text>
              </View>
            )}
            
            {result.advice.setAsideMl && (
              <View style={styles.adviceItem}>
                <Text style={styles.adviceIcon}>🧊</Text>
                <Text style={styles.adviceText}>
                  Zet {result.advice.setAsideMl}ml klaar voor de volgende voeding
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Deze tijden zijn indicatief en conservatief ingeschat. Twijfel je? Kies extra marge en/of raadpleeg een professional.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleSharePlan}>
          <Text style={styles.shareButtonText}>Deel planning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPlan}>
          <Text style={styles.confirmButtonText}>Plan bevestigen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#7A6C66',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    color: '#4B3C33',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#7A6C66',
  },
  safeFeedBadge: {
    backgroundColor: '#9BB9F4',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  safeFeedTitle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  safeFeedTime: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  safeFeedDate: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  timelineSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B3C33',
    marginBottom: 16,
  },
  timeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7A9DE8',
    marginRight: 16,
  },
  timelineDotSafe: {
    backgroundColor: '#4CAF50',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3C33',
    marginBottom: 2,
  },
  timelineLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#7A6C66',
  },
  scenarioSection: {
    marginBottom: 32,
  },
  sliderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sliderLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#4B3C33',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#7A9DE8',
    width: 20,
    height: 20,
  },
  sliderResult: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#7A6C66',
    marginTop: 12,
    textAlign: 'center',
  },
  adviceSection: {
    marginBottom: 32,
  },
  adviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adviceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  adviceText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#4B3C33',
    flex: 1,
  },
  disclaimer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  disclaimerText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#856404',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7A9DE8',
  },
  shareButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#7A9DE8',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#7A9DE8',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7A9DE8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
