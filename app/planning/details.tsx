import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DrinkPlan } from '../../src/types/planning';
import { WineGlassIcon, BeerMugIcon, SpiritsIcon, CocktailIcon } from '../../src/components/icons/DrinkIcons';

export default function PlanDrinkDetailsScreen() {
  const router = useRouter();
  const { planData } = useLocalSearchParams();
  const [plan, setPlan] = useState<Partial<DrinkPlan>>({
    drinks: 1,
    pace: 'TWO_HOURS',
    drinkType: 'WINE',
    goal: 'MIN_FREEZER',
    canPreFeed: true,
    canMicroPump: true,
    microPumpTargetMl: 80,
    safetyBufferMin: 30
  });
  const [glassFill] = useState(new Animated.Value(0.2));

  useEffect(() => {
    if (planData) {
      try {
        const parsedPlan = JSON.parse(planData as string);
        setPlan(parsedPlan);
      } catch (error) {
        console.error('Error parsing plan data:', error);
      }
    }
  }, [planData]);

  useEffect(() => {
    // Animate glass fill based on number of drinks
    const targetFill = Math.min(0.2 + (plan.drinks || 1) * 0.2, 1.0);
    Animated.timing(glassFill, {
      toValue: targetFill,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [plan.drinks, glassFill]);

  const drinkTypes = [
    { id: 'WINE', label: 'Wijn', icon: WineGlassIcon },
    { id: 'BEER', label: 'Bier', icon: BeerMugIcon },
    { id: 'COCKTAIL', label: 'Cocktail', icon: CocktailIcon },
    { id: 'OTHER', label: 'Overig', icon: SpiritsIcon }
  ];

  const paceOptions = [
    { 
      id: 'ONE_HOUR', 
      label: 'Alles binnen 1 uur',
      segments: 1,
      description: 'Intensief maar snel'
    },
    { 
      id: 'TWO_HOURS', 
      label: 'Gespreid over 2 uur',
      segments: 2,
      description: 'Gezellig tempo'
    },
    { 
      id: 'THREE_HOURS', 
      label: 'Gespreid over 3 uur',
      segments: 3,
      description: 'Rustig genieten'
    }
  ];

  const handleNext = () => {
    router.push({
      pathname: '/planning/context',
      params: { planData: JSON.stringify(plan) }
    });
  };

  const updatePlan = (updates: Partial<DrinkPlan>) => {
    setPlan(prev => ({ ...prev, ...updates }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>Stap 2 van 3</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Hoe ziet jouw avond eruit?</Text>
          <Text style={styles.subtitle}>We gebruiken dit om te berekenen wanneer je weer veilig kunt voeden.</Text>
        </View>

        {/* Growing Glass Animation */}
        <View style={styles.glassSection}>
          <Text style={styles.sectionLabel}>Aantal drankjes</Text>
          <View style={styles.glassContainer}>
            <View style={styles.glass}>
              <Animated.View 
                style={[
                  styles.glassFill,
                  {
                    height: glassFill.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['20%', '80%'],
                    })
                  }
                ]}
              />
              <Text style={styles.glassCount}>{plan.drinks}</Text>
            </View>
            <View style={styles.glassControls}>
              <TouchableOpacity 
                style={[styles.glassButton, plan.drinks <= 1 && styles.glassButtonDisabled]}
                onPress={() => updatePlan({ drinks: Math.max(1, (plan.drinks || 1) - 1) })}
              >
                <Text style={styles.glassButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.glassButton}
                onPress={() => updatePlan({ drinks: (plan.drinks || 1) + 1 })}
              >
                <Text style={styles.glassButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Drink Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Type drankje</Text>
          <View style={styles.typeGrid}>
            {drinkTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeOption,
                  plan.drinkType === type.id && styles.typeOptionActive
                ]}
                onPress={() => updatePlan({ drinkType: type.id as any })}
              >
                <type.icon size={24} />
                <Text style={[
                  styles.typeLabel,
                  plan.drinkType === type.id && styles.typeLabelActive
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pace with Timeline Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Drinktempo</Text>
          <View style={styles.paceContainer}>
            {paceOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.paceOption,
                  plan.pace === option.id && styles.paceOptionActive
                ]}
                onPress={() => updatePlan({ pace: option.id as any })}
              >
                <View style={styles.paceHeader}>
                  <Text style={[
                    styles.paceText,
                    plan.pace === option.id && styles.paceTextActive
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.paceDescription,
                    plan.pace === option.id && styles.paceDescriptionActive
                  ]}>
                    {option.description}
                  </Text>
                </View>
                <View style={styles.timelineVisualization}>
                  {Array.from({ length: option.segments }, (_, i) => (
                    <View 
                      key={i}
                      style={[
                        styles.timelineSegment,
                        plan.pace === option.id && styles.timelineSegmentActive
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Laat zien wat past</Text>
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
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#D1E0FF',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#7A9DE8',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    color: '#7A6C66',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    color: '#4B3C33',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#7A6C66',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  glassSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B3C33',
    marginBottom: 16,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  glass: {
    width: 80,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#9BB9F4',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 24,
  },
  glassFill: {
    width: '100%',
    backgroundColor: '#7A9DE8',
    position: 'absolute',
    bottom: 0,
  },
  glassCount: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 24,
    color: '#4B3C33',
    zIndex: 1,
  },
  glassControls: {
    gap: 12,
  },
  glassButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9BB9F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassButtonDisabled: {
    backgroundColor: '#D9D9D9',
  },
  glassButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,
    color: '#FFFFFF',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  typeOptionActive: {
    backgroundColor: '#9BB9F4',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#4B3C33',
  },
  typeLabelActive: {
    color: '#FFFFFF',
  },
  paceContainer: {
    gap: 16,
  },
  paceOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  paceOptionActive: {
    backgroundColor: '#9BB9F4',
  },
  paceHeader: {
    marginBottom: 12,
  },
  paceText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3C33',
    marginBottom: 4,
  },
  paceTextActive: {
    color: '#FFFFFF',
  },
  paceDescription: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#7A6C66',
  },
  paceDescriptionActive: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  timelineVisualization: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  timelineSegment: {
    height: 8,
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  timelineSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  nextButton: {
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
  nextButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
