import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";
import { useState } from "react";
import { useStore } from "../../src/state/store";

const { width, height } = Dimensions.get('window');

export default function WhatIsMMB() {
  const router = useRouter();
  const { updateProfile } = useStore();
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  const handleNext = () => {
    if (acceptedDisclaimer) {
      // Save medical disclaimer consent
      updateProfile({
        medicalDisclaimerConsent: true,
        consentTimestamp: new Date().toISOString(),
      });
      router.push('/onboarding/how-it-works');
    }
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
          <View style={[styles.progressBarFill, { width: 120 }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Wat is Mama Milk Bar?</Text>
        <Text style={styles.subtitle}>Voordat we beginnen, even duidelijk wat we wel en niet doen.</Text>

        {/* What it IS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dit zijn wij:</Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Indicaties gebaseerd op gemiddelden</Text> voor alcoholafbraak
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Een ondersteunend hulpmiddel</Text> voor planning
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Duidelijke veilige momenten</Text> om weer te voeden
            </Text>
          </View>

          {/* Happy Mimi within "Dit zijn wij" */}
          <Image
            source={require('../../assets/Mimi_karakters/2_mimi_happy_2.png')}
            style={styles.mimiHappy}
            resizeMode="contain"
          />

        </View>

        {/* What it's NOT */}
        <View style={[styles.card, styles.warningCard]}>
          <Text style={styles.cardTitle}>Dit zijn wij niet:</Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Geen medisch advies</Text> of real-time moedermelk testen
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Jij behoudt altijd de controle</Text> over je eigen beslissingen
            </Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              Raadpleeg bij twijfel altijd een arts of medisch specialist voor advies.
            </Text>
          </View>

          {/* Link naar Hoe wij rekenen */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/medical-info')}
          >
            <Text style={styles.linkText}>Lees meer over berekeningen en medische informatie</Text>
          </TouchableOpacity>

          {/* Verdrietige Mimi binnen "Dit zijn wij niet" */}
          <Image
            source={require('../../assets/Mimi_karakters/4_nogniet_2.png')}
            style={styles.mimiSad}
            resizeMode="contain"
          />
        </View>

        {/* Consent Checkbox */}
        <View style={styles.consentContainer}>
          <TouchableOpacity
            style={[styles.checkbox, acceptedDisclaimer && styles.checkboxActive]}
            onPress={() => setAcceptedDisclaimer(!acceptedDisclaimer)}
          >
            <View style={[styles.checkboxBox, acceptedDisclaimer && styles.checkboxBoxActive]}>
              {acceptedDisclaimer && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Ik begrijp dat dit indicaties zijn, geen medisch advies, en dat alle keuzes mijn eigen verantwoordelijkheid zijn
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Alle berekeningen zijn gebaseerd op algemene metabolisme-modellen.
          Raadpleeg bij twijfel altijd een arts of verloskundige.
        </Text>
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.button, !acceptedDisclaimer && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!acceptedDisclaimer}
      >
        <Text style={[styles.buttonText, !acceptedDisclaimer && styles.buttonTextDisabled]}>Ik begrijp het</Text>
      </TouchableOpacity>

      {/* Bottom Line */}
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
    maxWidth: 320,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    paddingBottom: 60,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
    position: 'relative',
    overflow: 'visible',
  },
  warningCard: {
    borderWidth: 2,
    borderColor: '#FFE4CC',
    backgroundColor: '#FFFAF5',
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'left',
    color: '#4B3B36',
    marginBottom: 16,
    paddingLeft: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontFamily: 'Poppins',
    fontSize: 20,
    lineHeight: 24,
    color: '#F49B9B',
    marginRight: 8,
    marginTop: -2,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 22,
    color: '#4B3B36',
  },
  bold: {
    fontWeight: '600',
  },
  disclaimerBox: {
    backgroundColor: '#FFE4CC',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  disclaimerText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20,
    color: '#8B5A3C',
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  linkText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#F49B9B',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  consentContainer: {
    width: '100%',
    maxWidth: 340,
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footerText: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#8E8B88',
    marginTop: 8,
    maxWidth: 300,
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
  buttonDisabled: {
    backgroundColor: '#E6E6E6',
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#B3AFAF',
  },
  mimiHappy: {
    position: 'absolute',
    width: 90,
    height: 110,
    bottom: -20,
    right: -10,
    zIndex: 10,
  },
  mimiSad: {
    position: 'absolute',
    width: 90,
    height: 110,
    bottom: -20,
    right: -10,
    zIndex: 10,
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
