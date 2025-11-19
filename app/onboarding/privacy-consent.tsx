/**
 * Privacy Consent & Medical Disclaimer Screen
 *
 * Apple App Store Requirements:
 * - Clear explanation of data collection
 * - User consent before collecting personal data
 * - Medical disclaimer for health-related apps
 * - Age gate (18+)
 */

import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

export default function PrivacyConsent() {
  const router = useRouter();
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  const canContinue = acceptedAge && acceptedPrivacy && acceptedDisclaimer;

  const handleContinue = () => {
    if (canContinue) {
      router.replace('/onboarding/survey-you');
    }
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
          <View style={[styles.progressBarFill, { width: 60 }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy & Voorwaarden</Text>
        <Text style={styles.subtitle}>Voordat we beginnen, even een paar belangrijke punten.</Text>

        {/* Age Gate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔞 Leeftijdscheck</Text>
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
          <Text style={styles.cardTitle}>⚕️ Medische disclaimer</Text>
          <Text style={styles.cardText}>
            Mommy Milk Bar is een <Text style={styles.bold}>informatieve tool</Text>, geen medisch advies.
            De app geeft richtlijnen op basis van algemene informatie en wetenschappelijke bronnen.
          </Text>
          <Text style={[styles.cardText, { marginTop: 12 }]}>
            Bij twijfel of vragen over jouw gezondheid of die van je baby, raadpleeg
            altijd een arts, verloskundige of lactatiekundige.
          </Text>
          <TouchableOpacity
            style={[styles.checkbox, acceptedDisclaimer && styles.checkboxActive]}
            onPress={() => setAcceptedDisclaimer(!acceptedDisclaimer)}
          >
            <View style={[styles.checkboxBox, acceptedDisclaimer && styles.checkboxBoxActive]}>
              {acceptedDisclaimer && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>Ik begrijp dat dit geen medisch advies is</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔒 Privacy & je data</Text>
          <Text style={styles.cardText}>
            We verzamelen persoonlijke informatie zoals je geboortedatum, gewicht, en gegevens
            over je baby om veilige voedtijden te berekenen.
          </Text>
          <Text style={[styles.cardText, { marginTop: 12 }]}>
            <Text style={styles.bold}>Jouw data blijft van jou:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Data wordt lokaal opgeslagen op je apparaat</Text>
          <Text style={styles.bulletPoint}>• Gevoelige data wordt versleuteld</Text>
          <Text style={styles.bulletPoint}>• We delen nooit je persoonlijke informatie</Text>
          <Text style={styles.bulletPoint}>• Je kunt je data altijd exporteren of verwijderen</Text>

          <TouchableOpacity
            style={[styles.checkbox, acceptedPrivacy && styles.checkboxActive]}
            onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
          >
            <View style={[styles.checkboxBox, acceptedPrivacy && styles.checkboxBoxActive]}>
              {acceptedPrivacy && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Ik ga akkoord met het verzamelen en opslaan van deze data
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legalLinks}>
          <TouchableOpacity>
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.legalLinkText}>Algemene Voorwaarden</Text>
          </TouchableOpacity>
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
  bulletPoint: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    color: '#7A6C66',
    marginLeft: 8,
    marginTop: 4,
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
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  legalLinkText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#E47C7C',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#B3AFAF',
    marginHorizontal: 8,
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
  bottomLine: {
    position: 'absolute',
    width: 143,
    height: 5,
    left: (width - 143) / 2,
    bottom: 14,
    backgroundColor: '#E6E6E6',
  },
});
