/**
 * Anonymous Consent Screen
 *
 * For users who choose "Continue without account"
 * Collects essential consents: age and medical disclaimer
 */

import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";
import { useStore } from "../../src/state/store";

const { width, height } = Dimensions.get('window');

export default function AnonymousConsent() {
  const router = useRouter();
  const { updateProfile, updateSettings } = useStore();
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedMedicalDisclaimer, setAcceptedMedicalDisclaimer] = useState(false);

  const canContinue = acceptedAge && acceptedMedicalDisclaimer;

  const handleContinue = () => {
    if (canContinue) {
      // Save consent data to store (even for anonymous users)
      updateProfile({
        consentVersion: '1.0.0',
        ageConsent: acceptedAge,
        medicalDisclaimerConsent: acceptedMedicalDisclaimer,
        consentTimestamp: new Date().toISOString(),
      });

      // Mark onboarding as completed
      updateSettings({ hasCompletedOnboarding: true });

      // Navigate to main app
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="variant1" />

      {/* Fixed header with back button */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" fill="#F49B9B" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nog even dit...</Text>
        <Text style={styles.subtitle}>
          Om de app te gebruiken hebben we je toestemming nodig voor deze twee punten.
        </Text>

        {/* Age Gate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Leeftijdscheck</Text>
          <Text style={styles.cardText}>
            Mommy Milk Bar is alleen bedoeld voor volwassenen van 18 jaar en ouder.
            Deze app helpt bij het plannen van veilige voedmomenten na alcoholgebruik.
          </Text>
          <TouchableOpacity
            style={[styles.checkbox, acceptedAge && styles.checkboxActive]}
            onPress={() => setAcceptedAge(!acceptedAge)}
          >
            <View style={[styles.checkboxBox, acceptedAge && styles.checkboxBoxActive]}>
              {acceptedAge && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>Ik ben 18 jaar of ouder</Text>
          </TouchableOpacity>
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medische disclaimer</Text>
          <Text style={styles.cardText}>
            Mommy Milk Bar geeft indicaties op basis van wetenschappelijke bronnen,
            maar dit is <Text style={styles.bold}>geen medisch advies</Text>.
          </Text>
          <Text style={[styles.cardText, { marginTop: 12 }]}>
            Alle keuzes rondom alcohol en borstvoeding zijn je eigen verantwoordelijkheid.
            Bij twijfel raadpleeg altijd een arts, verloskundige of lactatiekundige.
          </Text>

          <TouchableOpacity
            style={[styles.checkbox, acceptedMedicalDisclaimer && styles.checkboxActive]}
            onPress={() => setAcceptedMedicalDisclaimer(!acceptedMedicalDisclaimer)}
          >
            <View style={[styles.checkboxBox, acceptedMedicalDisclaimer && styles.checkboxBoxActive]}>
              {acceptedMedicalDisclaimer && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Ik begrijp dat dit indicaties zijn, geen medisch advies, en dat alle keuzes mijn eigen verantwoordelijkheid zijn
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            Je data wordt lokaal opgeslagen op je apparaat.
            We delen nooit je persoonlijke informatie met derden.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!canContinue}
      >
        <Text style={[styles.buttonText, !canContinue && styles.buttonTextDisabled]}>
          Akkoord & doorgaan
        </Text>
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
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    marginBottom: 24,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    color: '#4B3B36',
    marginBottom: 12,
  },
  cardText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 22,
    color: '#7A6C66',
  },
  bold: {
    fontWeight: '600',
    color: '#4B3B36',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#F9F9F9',
  },
  checkboxActive: {
    borderColor: '#F49B9B',
    backgroundColor: '#FDF2F2',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C7CED9',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxActive: {
    borderColor: '#F49B9B',
    backgroundColor: '#F49B9B',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#4B3B36',
    flex: 1,
  },
  privacyNote: {
    backgroundColor: '#FFF8F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  privacyText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#8E8B88',
    textAlign: 'center',
    lineHeight: 18,
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
  buttonDisabled: {
    backgroundColor: '#E6E6E6',
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#B3AFAF',
  },
});
