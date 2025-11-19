import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from "../../src/state/store";

const { width, height } = Dimensions.get('window');

export default function SurveyYou() {
  const router = useRouter();
  const { settings, updateSettings } = useStore();

  // Default birthdate: 30 years ago
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 30);

  const [motherBirthdate, setMotherBirthdate] = useState<Date>(
    settings.motherBirthdate ? new Date(settings.motherBirthdate) : defaultDate
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState<number>(settings.weightKg ?? 65);
  const [heightCm, setHeightCm] = useState<number>(settings.heightCm ?? 170);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setMotherBirthdate(selectedDate);
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
    const years = Math.floor((today.getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    return `${years} jaar oud`;
  };

  const handleNext = () => {
    updateSettings({
      motherBirthdate: motherBirthdate.toISOString(),
      weightKg: weight,
      heightCm
    });
    router.replace('/onboarding/survey-baby');
  };

  return (
    <View style={styles.container}>
      <Svg 
        width={width} 
        height={504} 
        style={styles.onboardingShape}
        viewBox="0 0 414 504"
        preserveAspectRatio="xMinYMin slice"
      >
        <Path 
          d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z" 
          fill="#FFE2D8"
        />
      </Svg>

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
          <View style={[styles.progressBarFill, { width: 207 }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Even over jou…</Text>
        <Text style={styles.subtitle}>zodat we beter kunnen berekenen hoe snel je lichaam alcohol afbreekt.</Text>

        {/* Birthdate picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wat is je geboortedatum?</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(motherBirthdate)}</Text>
            <Text style={styles.ageText}>{calculateAge(motherBirthdate)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={motherBirthdate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
              minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 60))}
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

        {/* Weight and Height sliders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wat is je gewicht en lengte?</Text>

          <Text style={styles.metricLabel}>Gewicht: {weight} kg</Text>
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

          <Text style={[styles.metricLabel, { marginTop: 16 }]}>Lengte: {heightCm} cm</Text>
          <Slider
            style={styles.slider}
            minimumValue={150}
            maximumValue={205}
            step={1}
            value={heightCm}
            onValueChange={setHeightCm}
            minimumTrackTintColor="#F49B9B"
            maximumTrackTintColor="#E6E6E6"
            thumbTintColor="#F49B9B"
          />
        </View>
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
  onboardingShape: {
    position: 'absolute',
    width: '100%',
    height: 504,
    left: 0,
    top: 0,
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
    paddingBottom: 160, // ensure space for CTA button
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
    marginBottom: 12,
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
  metricLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#4B3B36',
  },
  slider: {
    width: '100%',
    height: 40,
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
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
});


