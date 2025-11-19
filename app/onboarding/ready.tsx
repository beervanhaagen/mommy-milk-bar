import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Rect, Polyline } from "react-native-svg";
import { useStore } from "../../src/state/store";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

// SVG Icon Components
const CloudIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
      stroke="#F49B9B"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const DatabaseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.5 2 2 3.79 2 6v12c0 2.21 4.5 4 10 4s10-1.79 10-4V6c0-2.21-4.5-4-10-4z"
      stroke="#F49B9B"
      strokeWidth={2}
      fill="none"
    />
    <Path
      d="M2 12c0 2.21 4.5 4 10 4s10-1.79 10-4"
      stroke="#F49B9B"
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const ChartIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="22 12 18 12 15 21 9 3 6 12 2 12"
      stroke="#F49B9B"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ShieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="#F49B9B"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// Confetti Component
const Confetti = () => {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => {
    const isWhite = i % 2 === 0;
    const size = Math.random() * 8 + 4;
    const left = Math.random() * width;
    const delay = Math.random() * 2;
    const duration = Math.random() * 3 + 2;

    return (
      <View
        key={i}
        style={[
          styles.confettiPiece,
          {
            backgroundColor: isWhite ? '#FFFFFF' : '#F49B9B',
            width: size,
            height: size,
            left,
            top: -20 - Math.random() * 50,
            opacity: 0.7 + Math.random() * 0.3,
          },
        ]}
      />
    );
  });

  return <View style={styles.confettiContainer}>{confettiPieces}</View>;
};

export default function Ready() {
  const router = useRouter();
  const { updateSettings } = useStore();
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSkip = () => {
    updateSettings({ hasCompletedOnboarding: true });
    router.replace('/(tabs)');
  };

  const handleCreateAccount = () => {
    // TODO: Implement account creation with database
    // For now, just mark onboarding as complete and go to app
    updateSettings({ hasCompletedOnboarding: true });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground variant="variant2" />

      {/* Confetti Effect */}
      {!showAccountForm && <Confetti />}

      {/* Fixed header with progress bar */}
      <View style={styles.fixedHeader}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: 300 }]} />
        </View>
      </View>

      {!showAccountForm ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mimi Character - Happy */}
          <View style={styles.mimiContainer}>
            <Image
              source={require('../../assets/Mimi_karakters/2_mimi_happy_2.png')}
              style={styles.mimiImage}
              resizeMode="contain"
            />
          </View>

          {/* Success Message */}
          <Text style={styles.title}>Je bent klaar!</Text>
          <Text style={styles.subtitle}>
            Dat is alles wat we nodig hebben.{'\n'}
            Je kunt nu direct beginnen.
          </Text>

          {/* Benefits of Account */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Account aanmaken (optioneel)</Text>
            <Text style={styles.benefitsSubtitle}>Voordelen:</Text>

            <View style={styles.benefit}>
              <View style={styles.benefitIconContainer}>
                <CloudIcon />
              </View>
              <Text style={styles.benefitText}>Sync tussen apparaten</Text>
            </View>

            <View style={styles.benefit}>
              <View style={styles.benefitIconContainer}>
                <DatabaseIcon />
              </View>
              <Text style={styles.benefitText}>Back-up van je gegevens</Text>
            </View>

            <View style={styles.benefit}>
              <View style={styles.benefitIconContainer}>
                <ChartIcon />
              </View>
              <Text style={styles.benefitText}>Geschiedenis bewaren</Text>
            </View>
          </View>

          {/* Create Account Button - Outside white container */}
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => setShowAccountForm(true)}
          >
            <Text style={styles.createAccountButtonText}>Maak account aan</Text>
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Ga door zonder account</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <>
          {/* Account Creation Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Account aanmaken</Text>
            <Text style={styles.formSubtitle}>
              Maak een account om je gegevens te synchroniseren
            </Text>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="je@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Wachtwoord</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimaal 8 tekens"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.privacyNote}>
                <ShieldIcon />
                <Text style={styles.privacyNoteText}>
                  Je gegevens worden veilig opgeslagen. We delen nooit persoonlijke informatie.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, (!email || !password || password.length < 8) && styles.buttonDisabled]}
              onPress={handleCreateAccount}
              disabled={!email || !password || password.length < 8}
            >
              <Text style={styles.buttonText}>Account aanmaken</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLink} onPress={() => setShowAccountForm(false)}>
              <Text style={styles.backLinkText}>← Terug</Text>
            </TouchableOpacity>
          </View>
        </>
        </ScrollView>
      )}

      {/* Bottom Line */}
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
    justifyContent: 'center',
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
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height,
    zIndex: 1,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 80,
    alignItems: 'center',
  },
  mimiContainer: {
    width: width * 0.456,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  mimiImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 42,
    textAlign: 'center',
    color: '#4B3B36',
    marginTop: 20,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
    marginTop: 12,
    paddingHorizontal: 24,
  },
  benefitsCard: {
    width: width - 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 24,
  },
  benefitsTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 4,
  },
  benefitsSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingLeft: 8,
  },
  benefitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#4B3B36',
    flex: 1,
  },
  createAccountButton: {
    width: width - 48,
    maxWidth: 374,
    height: 63,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createAccountButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  skipButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#8E8B88',
    textDecorationLine: 'underline',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  formTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 8,
  },
  formSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 24,
  },
  inputCard: {
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
  },
  inputLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#4B3B36',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#4B3B36',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  privacyNoteText: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 11,
    lineHeight: 16,
    color: '#8E8B88',
    textAlign: 'center',
    marginLeft: 6,
    flex: 1,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    height: 56,
    backgroundColor: '#F49B9B',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#D9D9D9',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  backLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backLinkText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#8E8B88',
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
