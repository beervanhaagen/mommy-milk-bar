import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Rect, Polyline } from "react-native-svg";
import { useStore } from "../../src/state/store";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

// SVG Icon Components
const ShieldIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
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

const HeartIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="#F49B9B"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} stroke="#F49B9B" strokeWidth={2} fill="none" />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke="#F49B9B" strokeWidth={2} strokeLinecap="round" />
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

  const handleSkip = () => {
    // Navigate to anonymous consent screen first
    router.push('/onboarding/anonymous-consent');
  };

  const handleCreateAccount = () => {
    // Navigate to privacy consent before account creation (GDPR requirement)
    router.push('/onboarding/privacy-consent');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground variant="variant2" />

      {/* Confetti Effect */}
      <Confetti />

      {/* Fixed header with progress bar */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" fill="#F49B9B" />
          </Svg>
        </TouchableOpacity>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: 262.5 }]} />
        </View>
      </View>

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
          <Text style={styles.benefitsTitle}>Account aanmaken</Text>
          <Text style={styles.benefitsSubtitle}>Voordelen:</Text>

          <View style={styles.benefit}>
            <View style={styles.benefitIconContainer}>
              <ShieldIcon />
            </View>
            <Text style={styles.benefitText}>Zekerheid bij elke voeding</Text>
          </View>

          <View style={styles.benefit}>
            <View style={styles.benefitIconContainer}>
              <HeartIcon />
            </View>
            <Text style={styles.benefitText}>Vertrouwen in je beslissingen</Text>
          </View>

          <View style={styles.benefit}>
            <View style={styles.benefitIconContainer}>
              <CalendarIcon />
            </View>
            <Text style={styles.benefitText}>Altijd inzicht in je planning</Text>
          </View>
        </View>

        {/* Create Account Button - Outside white container */}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={handleCreateAccount}
        >
          <Text style={styles.createAccountButtonText}>Maak account aan</Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Ga door zonder account</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Ik heb al een account, inloggen</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Line */}
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
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    position: 'relative',
    overflow: 'hidden',
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
  loginButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#F49B9B',
    textDecorationLine: 'underline',
  },
});
