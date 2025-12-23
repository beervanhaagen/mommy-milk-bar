import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useStore } from "../../src/state/store";
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

export default function SurveyBaby() {
  const router = useRouter();
  const { getActiveBaby, updateSettings } = useStore();
  const activeBaby = getActiveBaby();

  // Default birthdate: 2 maanden geleden
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() - 2);

  const [babyBirthdate, setBabyBirthdate] = useState<Date>(
    activeBaby?.birthdate ? new Date(activeBaby.birthdate) : defaultDate
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
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

  const calculateAge = (birthdate: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birthdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const months = Math.floor(diffDays / 30);

    if (months === 0) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weken'} oud`;
    } else if (months < 12) {
      return `${months} ${months === 1 ? 'maand' : 'maanden'} oud`;
    } else {
      const years = Math.floor(months / 12);
      return `${years} ${years === 1 ? 'jaar' : 'jaar'} oud`;
    }
  };

  const handleNext = () => {
    updateSettings({
      babyBirthdate: babyBirthdate.toISOString(),
    });
    router.replace('/onboarding/survey-feeding');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="variant3" />

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
        <Text style={styles.title}>Over je baby</Text>
        <Text style={styles.subtitle}>Zo weten we hoe vaak je waarschijnlijk nog voedt.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wat is de geboortedatum van je baby?</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(babyBirthdate)}</Text>
            <Text style={styles.ageText}>{calculateAge(babyBirthdate)}</Text>
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
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.doneButtonText}>Klaar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Doorgaan</Text>
      </TouchableOpacity>

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
    marginTop: 120,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 160,
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
    marginBottom: 14,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 14,
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 12,
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
  pill: {
    borderWidth: 1,
    borderColor: '#C7CED9',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  pillActive: { borderColor: '#F49B9B', backgroundColor: '#F9FBFF' },
  pillText: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 14, color: '#4B3B36' },
  pillTextActive: { color: '#E47C7C' },
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
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metricLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#4B3B36',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
