import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useStore } from "../../src/state/store";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

const PUMP: Array<{ label: string; value: 'yes' | 'no' | 'later' }>= [
  { label: 'Ja, ik kolf ook melk', value: 'yes' },
  { label: 'Nee, ik geef alleen direct uit borst', value: 'no' },
  { label: 'Nog niet zeker / wil ik later instellen', value: 'later' },
];

export default function SurveyPump() {
  const router = useRouter();
  const { getActiveBaby, updateSettings } = useStore();
  const activeBaby = getActiveBaby();
  const [pump, setPump] = useState<typeof PUMP[number]['value']>(activeBaby?.pumpPreference ?? 'later');

  const handleNext = () => {
    updateSettings({ pumpPreference: pump });
    router.push('/onboarding/completion');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="variant3" />

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: 300 }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Plannen met afgekolfde melk?</Text>
        <Text style={styles.subtitle}>Zo kunnen we berekenen wanneer je weer veilig kunt voeden of melk kunt gebruiken na een glaasje.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wil je dat we hiermee rekening houden?</Text>
          {PUMP.map(opt => (
            <TouchableOpacity key={opt.value} style={[styles.option, pump === opt.value && styles.optionActive]} onPress={() => setPump(opt.value)}>
              <Text style={styles.optionText}>{opt.label}</Text>
              <View style={[styles.radio, pump === opt.value && styles.radioActive]} />
            </TouchableOpacity>
          ))}
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
  progressBarContainer: {
    position: 'absolute',
    width: 300,
    height: 4,
    left: 57,
    top: 74,
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7CED9',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionActive: {
    borderColor: '#A7B4C7',
    backgroundColor: '#F9FBFF',
  },
  optionText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#4B3B36',
    flexShrink: 1,
    paddingRight: 12,
  },
  radio: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#F49B9B',
    backgroundColor: '#FAF7F3',
  },
  radioActive: {
    backgroundColor: '#FAD2D2',
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
});


