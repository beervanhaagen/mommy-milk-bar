import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { PlannerCard } from '../../src/components/PlannerCard';
import { PlanningHeader } from '../../src/components/PlanningHeader';
import { TimeSelector } from '../../src/components/TimeSelector';
import { DrinkSelector } from '../../src/components/DrinkSelector';
import { FeedContextSelector } from '../../src/components/FeedContextSelector';
import { TimelinePreview } from '../../src/components/TimelinePreview';
import { DrinkPlan, Feasibility } from '../../src/types/planning';
import { assessPlan, getFeasibilityColor } from '../../src/lib/planning';

export default function PlanDrinkInlineScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Partial<DrinkPlan>>({
    startAt: new Date(),
    drinks: 1,
    pace: 'TWO_HOURS',
    drinkType: 'WINE',
    goal: 'MIN_FREEZER',
    canPreFeed: true,
    canMicroPump: true,
    microPumpTargetMl: 80,
    safetyBufferMin: 30
  });
  const [feasibility, setFeasibility] = useState<Feasibility>('GREEN');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiAnim] = useState(new Animated.Value(0));

  // Mock feed history for now - in real app this would come from user data
  const mockFeedHistory = [
    { at: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours ago
    { at: new Date(Date.now() - 4 * 60 * 60 * 1000) }, // 4 hours ago
    { at: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // 6 hours ago
  ];

  const mockContext = {
    typicalMlPerFeed: 120,
    eveningCluster: true
  };

  // Calculate feasibility when plan changes
  useEffect(() => {
    if (plan.startAt && plan.drinks && plan.pace) {
      const fullPlan: DrinkPlan = {
        startAt: plan.startAt,
        drinks: plan.drinks,
        pace: plan.pace,
        drinkType: plan.drinkType || 'WINE',
        goal: plan.goal || 'MIN_FREEZER',
        canPreFeed: plan.canPreFeed || true,
        canMicroPump: plan.canMicroPump || true,
        microPumpTargetMl: plan.microPumpTargetMl,
        safetyBufferMin: plan.safetyBufferMin || 30
      };

      try {
        const assessment = assessPlan(fullPlan, mockFeedHistory, mockContext);
        setFeasibility(assessment.feasibility);
      } catch (error) {
        console.log('Assessment error:', error);
        setFeasibility('GREEN');
      }
    }
  }, [plan]);

  const isPlanComplete = (plan: Partial<DrinkPlan>): boolean => {
    return !!(plan.startAt && plan.drinks && plan.pace && plan.drinkType);
  };

  const handleSave = () => {
    if (!isPlanComplete(plan)) return;

    // Add haptic feedback
    Vibration.vibrate(100);

    // Show confetti animation
    setShowConfetti(true);
    Animated.sequence([
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowConfetti(false);
      // Navigate back to home or show success
      router.back();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <PlanningHeader />

        <View style={styles.content}>
          {/* Card 1: Startmoment */}
          <PlannerCard title="Wanneer wil je drinken?">
            <TimeSelector
              selectedTime={plan.startAt || new Date()}
              onTimeChange={(time) => setPlan(prev => ({ ...prev, startAt: time }))}
            />
          </PlannerCard>

          {/* Card 2: Drankjes & tempo */}
          <PlannerCard title="Hoeveel en hoe snel wil je drinken?">
            <DrinkSelector
              drinks={plan.drinks || 1}
              drinkType={plan.drinkType || 'WINE'}
              pace={plan.pace || 'TWO_HOURS'}
              onDrinksChange={(drinks) => setPlan(prev => ({ ...prev, drinks }))}
              onDrinkTypeChange={(type) => setPlan(prev => ({ ...prev, drinkType: type as any }))}
              onPaceChange={(pace) => setPlan(prev => ({ ...prev, pace: pace as any }))}
            />
          </PlannerCard>

          {/* Card 3: Voedingscontext */}
          <PlannerCard title="Voeding & voorbereiding">
            <FeedContextSelector
              feedStrategy={plan.goal === 'MIN_FREEZER' ? 'DIRECT' : 'PUMP'}
              freezerStockMl={plan.microPumpTargetMl || 0}
              onFeedStrategyChange={(strategy) => setPlan(prev => ({ 
                ...prev, 
                goal: strategy === 'DIRECT' ? 'MIN_FREEZER' : 'MAX_RELAX' 
              }))}
              onFreezerStockChange={(ml) => setPlan(prev => ({ ...prev, microPumpTargetMl: ml }))}
            />
          </PlannerCard>

          {/* Card 4: Resultaat & simulatie */}
          <PlannerCard title="Jouw planning">
            <TimelinePreview
              plan={plan}
              feasibility={feasibility}
            />
          </PlannerCard>

          {/* Mimi Tip */}
          <View style={styles.mimiTip}>
            <Text style={styles.mimiText}>
              Even slim plannen, zodat jij straks echt kunt ontspannen
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            !isPlanComplete(plan) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isPlanComplete(plan)}
        >
          <Text style={[
            styles.saveButtonText,
            !isPlanComplete(plan) && styles.saveButtonTextDisabled
          ]}>
            Planning opslaan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confetti Animation */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          <Animated.View style={[styles.confetti, { opacity: confettiAnim }]}>
            <Text style={styles.confettiText}>🎉</Text>
          </Animated.View>
          <Text style={styles.confettiMessage}>
            🎉 Je planning staat klaar! Ik hou de tijd voor je bij ⏰💚
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  mimiTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F49B9B',
  },
  mimiText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#4B3C33',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: '#9BB9F4',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  saveButtonDisabled: {
    backgroundColor: '#D9D9D9',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#7A6C66',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  confetti: {
    marginBottom: 16,
  },
  confettiText: {
    fontSize: 48,
  },
  confettiMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#4B3C33',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});