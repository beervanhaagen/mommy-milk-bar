import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from "../../src/state/store";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

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
  const { profile, getActiveBaby, addBaby, updateProfile, updateBaby } = useStore();
  const activeBaby = getActiveBaby();

  const [weight, setWeight] = useState<number>(profile.weightKg ?? 65);
  const defaultBabyDate = () => {
    if (activeBaby?.birthdate) {
      return new Date(activeBaby.birthdate);
    }
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() - 2);
    return fallback;
  };
  const [babyBirthdate, setBabyBirthdate] = useState<Date>(() => defaultBabyDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [breastfeedingWeeks, setBreastfeedingWeeks] = useState<number>(12);
  const [givesFormula, setGivesFormula] = useState<typeof FORMULA_OPTIONS[number]['value']>('no');
  const [productionStable, setProductionStable] = useState<typeof PRODUCTION_OPTIONS[number]['value']>('stable');

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBabyBirthdate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const describeAge = (birthdate: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birthdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const months = Math.floor(diffDays / 30);

    if (months === 0) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weken'} oud`;
    }
    if (months < 12) {
      return `${months} ${months === 1 ? 'maand' : 'maanden'} oud`;
    }
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'jaar' : 'jaar'} oud`;
  };

  const handleNext = () => {
    updateProfile({
      weightKg: weight,
    });

    if (activeBaby) {
      updateBaby(activeBaby.id, {
        birthdate: babyBirthdate.toISOString(),
        feedingType: givesFormula === 'yes' ? 'mix' : 'breast',
        typicalAmountMl: undefined,
        feedsPerDay: undefined,
        pumpPreference: productionStable === 'stable' ? 'yes' : productionStable === 'variable' ? 'later' : 'no',
      });
    } else {
      addBaby({
        birthdate: babyBirthdate.toISOString(),
        name: undefined,
        feedingType: givesFormula === 'yes' ? 'mix' : 'breast',
        feedsPerDay: undefined,
        typicalAmountMl: undefined,
        pumpPreference: productionStable === 'stable' ? 'yes' : productionStable === 'variable' ? 'later' : 'no',
        isActive: true,
      });
    }

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

        {/* Baby Birthdate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wat is de geboortedatum van je baby?</Text>
          <Text style={styles.cardSubtitle}>Zo kunnen we nauwkeurig je voedingsritme inschatten</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(babyBirthdate)}</Text>
            <Text style={styles.ageText}>{describeAge(babyBirthdate)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={babyBirthdate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 3))}
            />
          )}

          {Platform.OS === 'ios' && showDatePicker && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.doneButtonText}>Klaar</Text>
            </TouchableOpacity>
          )}
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
    backgroundColor: '#FAF7F3',
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#F49B9B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#F9FBFF',
    alignItems: 'center',
  },
  dateButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#4B3B36',
    marginBottom: 4,
  },
  ageText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#E47C7C',
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: '#F49B9B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
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
