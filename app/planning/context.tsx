import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DrinkPlan } from '../../src/types/planning';

export default function FeedingContextScreen() {
  const router = useRouter();
  const { planData } = useLocalSearchParams();
  const [plan, setPlan] = useState<Partial<DrinkPlan>>({
    prePump: false,
    targetVolumeMl: 120,
    freezerStockMl: 0
  });

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

  const handleNext = () => {
    router.push({
      pathname: '/planning/result',
      params: { planData: JSON.stringify(plan) }
    });
  };

  const updatePlan = (updates: Partial<DrinkPlan>) => {
    setPlan(prev => ({ ...prev, ...updates }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Voedingscontext</Text>
          <Text style={styles.subtitle}>Hoe bereid je je voor op je drankje?</Text>
        </View>

        {/* Pre-pump Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Pompvoorraad maken</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                !plan.prePump && styles.toggleOptionActive
              ]}
              onPress={() => updatePlan({ prePump: false })}
            >
              <Text style={[
                styles.toggleText,
                !plan.prePump && styles.toggleTextActive
              ]}>
                Nee, ik geef direct uit borst
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                plan.prePump && styles.toggleOptionActive
              ]}
              onPress={() => updatePlan({ prePump: true })}
            >
              <Text style={[
                styles.toggleText,
                plan.prePump && styles.toggleTextActive
              ]}>
                Ja, ik wil voorraad maken
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Target Volume (if pre-pump enabled) */}
        {plan.prePump && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Gewenste hoeveelheid (ml)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={plan.targetVolumeMl?.toString() || '120'}
                onChangeText={(text) => updatePlan({ targetVolumeMl: parseInt(text) || 120 })}
                keyboardType="numeric"
                placeholder="120"
              />
              <Text style={styles.inputLabel}>ml</Text>
            </View>
          </View>
        )}

        {/* Freezer Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Vriesvoorraad</Text>
          <Text style={styles.sectionSubtext}>Hoeveel ml heb je al in de vriezer?</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={plan.freezerStockMl?.toString() || '0'}
              onChangeText={(text) => updatePlan({ freezerStockMl: parseInt(text) || 0 })}
              keyboardType="numeric"
              placeholder="0"
            />
            <Text style={styles.inputLabel}>ml</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Tip</Text>
          <Text style={styles.infoText}>
            {plan.prePump 
              ? `Zet ${plan.targetVolumeMl || 120}ml klaar voor de periode dat je niet kunt voeden.`
              : 'Zorg dat je baby goed gevoed is vóór je eerste drankje.'
            }
          </Text>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Bereken planning</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B3C33',
    marginBottom: 8,
  },
  sectionSubtext: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    marginBottom: 12,
  },
  toggleContainer: {
    gap: 12,
  },
  toggleOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleOptionActive: {
    backgroundColor: '#9BB9F4',
  },
  toggleText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#4B3C33',
    textAlign: 'center',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#4B3C33',
    paddingVertical: 16,
  },
  inputLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#7A6C66',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3C33',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
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
