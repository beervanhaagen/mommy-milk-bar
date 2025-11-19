import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import Slider from '@react-native-community/slider';
import { useStore } from "../../src/state/store";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

const BABY_AGE_OPTIONS: Array<{ label: string; value: '0-3mo' | '3-6mo' | '6-12mo' | '12mo+' }> = [
  { label: '0-3 maanden', value: '0-3mo' },
  { label: '3-6 maanden', value: '3-6mo' },
  { label: '6-12 maanden', value: '6-12mo' },
  { label: '12+ maanden', value: '12mo+' },
];

const FORMULA_OPTIONS: Array<{ label: string; value: 'yes' | 'no' }> = [
  { label: 'Ja, ik geef ook kunstvoeding', value: 'yes' },
  { label: 'Nee, alleen borstvoeding', value: 'no' },
];

const PRODUCTION_OPTIONS: Array<{ label: string; value: 'stable' | 'variable' | 'uncertain' }> = [
  { label: 'Ja, productie is stabiel', value: 'stable' },
  { label: 'Nee, wisselend', value: 'variable' },
  { label: 'Weet ik niet zeker', value: 'uncertain' },
];

export default function EssentialInfo() {
  const router = useRouter();
  const { settings, updateSettings } = useStore();

  const [weight, setWeight] = useState<number>(settings.weightKg ?? 65);
  const [babyAge, setBabyAge] = useState<typeof BABY_AGE_OPTIONS[number]['value']>('0-3mo');
  const [breastfeedingWeeks, setBreastfeedingWeeks] = useState<number>(12);
  const [givesFormula, setGivesFormula] = useState<typeof FORMULA_OPTIONS[number]['value']>('no');
  const [productionStable, setProductionStable] = useState<typeof PRODUCTION_OPTIONS[number]['value']>('stable');

  const handleNext = () => {
    // Map baby age to existing format if needed
    const babyAgeMapping = {
      '0-3mo': '0-2mo',
      '3-6mo': '4-6mo',
      '6-12mo': '6-9mo',
      '12mo+': '9+mo',
    };

    updateSettings({
      weightKg: weight,
      babyAgeRange: babyAgeMapping[babyAge],
      breastfeedingWeeks: breastfeedingWeeks,
      givesFormula: givesFormula === 'yes',
      milkProductionStable: productionStable,
    });

    router.push('/onboarding/ready');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground variant="variant1" />

      {/* Fixed header with back button and progress bar */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" fill="#F49B9B"/>
          </Svg>
        </TouchableOpacity>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: 240 }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nog even 5 vragen</Text>
        <Text style={styles.subtitle}>Zodat we accurate berekeningen kunnen maken</Text>

        {/* Weight Slider */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wat is je gewicht?</Text>
          <Text style={styles.cardSubtitle}>Dit gebruiken we voor de alcoholafbraak berekening</Text>

          <Text style={styles.metricValue}>{weight} kg</Text>
          <Slider
            style={styles.slider}
            minimumValue={45}
            maximumValue={120}
            step={1}
            value={weight}
            onValueChange={setWeight}
            minimumTrackTintColor="#F49B9B"
            maximumTrackTintColor="#E6E6E6"
            thumbTintColor="#F49B9B"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>45 kg</Text>
            <Text style={styles.sliderLabel}>120 kg</Text>
          </View>
        </View>

        {/* Baby Age */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hoe oud is je baby?</Text>
          <Text style={styles.cardSubtitle}>Voor context bij voedingsritme</Text>

          {BABY_AGE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, babyAge === opt.value && styles.optionActive]}
              onPress={() => setBabyAge(opt.value)}
            >
              <Text style={styles.optionText}>{opt.label}</Text>
              <View style={[styles.radio, babyAge === opt.value && styles.radioActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Breastfeeding Duration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hoe lang geef je al borstvoeding?</Text>
          <Text style={styles.cardSubtitle}>Dit helpt ons je voedingspatroon beter te begrijpen</Text>

          <Text style={styles.metricValue}>{breastfeedingWeeks} weken</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={104}
            step={1}
            value={breastfeedingWeeks}
            onValueChange={setBreastfeedingWeeks}
            minimumTrackTintColor="#F49B9B"
            maximumTrackTintColor="#E6E6E6"
            thumbTintColor="#F49B9B"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0 weken</Text>
            <Text style={styles.sliderLabel}>2 jaar</Text>
          </View>
        </View>

        {/* Formula Feeding */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Geef je ook kunstvoeding?</Text>
          <Text style={styles.cardSubtitle}>Om te zien of borstvoeding voldoende is</Text>

          {FORMULA_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, givesFormula === opt.value && styles.optionActive]}
              onPress={() => setGivesFormula(opt.value)}
            >
              <Text style={styles.optionText}>{opt.label}</Text>
              <View style={[styles.radio, givesFormula === opt.value && styles.radioActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Milk Production Stability */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Is je melkproductie stabiel?</Text>
          <Text style={styles.cardSubtitle}>Voor beter begrip van je voedingspatroon</Text>

          {PRODUCTION_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, productionStable === opt.value && styles.optionActive]}
              onPress={() => setProductionStable(opt.value)}
            >
              <Text style={styles.optionText}>{opt.label}</Text>
              <View style={[styles.radio, productionStable === opt.value && styles.radioActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>
          Je kunt meer details later toevoegen in de instellingen
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Doorgaan</Text>
      </TouchableOpacity>

      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF4',
    position: 'relative',
    width: width,
    height: height,
  },
  fixedHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressBarTrack: {
    width: 300,
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#F49B9B',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    marginTop: 100,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 16,
  },
  metricValue: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
    color: '#F49B9B',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#8E8B88',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionActive: {
    borderColor: '#F49B9B',
    backgroundColor: '#FFF5F5',
  },
  optionText: {
    flex: 1,
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#4B3B36',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6E6E6',
    backgroundColor: '#FFFFFF',
  },
  radioActive: {
    borderColor: '#F49B9B',
    backgroundColor: '#F49B9B',
  },
  footerText: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#8E8B88',
    marginTop: 16,
    fontStyle: 'italic',
  },
  button: {
    position: 'absolute',
    width: 374,
    height: 63,
    left: (width - 374) / 2,
    bottom: 40,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  bottomLine: {
    position: 'absolute',
    width: 143,
    height: 5,
    left: (width - 143) / 2,
    bottom: 14,
    backgroundColor: '#E6E6E6',
  },
});
