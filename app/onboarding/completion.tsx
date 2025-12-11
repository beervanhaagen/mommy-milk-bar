import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../src/state/store";
import { useAuth } from "../../src/contexts/AuthContext";
import Svg, { Path } from "react-native-svg";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

type ConfettiPiece = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
};

// Simple inline icons (brand-consistent, no emojis)
const ChartIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M3 3v18h18" fill="none" stroke="#F49B9B" strokeWidth={2}/>
    <Path d="M7 15l3-4 4 3 5-7" fill="none" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

const BottleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M10 2h4v3l2 2v3H8V7l2-2V2z" fill="#FFFFFF" stroke="#F49B9B" strokeWidth={2}/>
    <Path d="M8 10h8v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

const CloudIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M6 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11-1A4 4 0 0 0 6 18z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

export default function Completion() {
  const router = useRouter();
  const { updateSettings } = useStore();
  const { isAuthenticated } = useAuth();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Redirect authenticated users away from this screen
  // This screen is only for new accounts/guest mode
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const pieces: ConfettiPiece[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      delay: Math.random() * 1500,
      duration: 2800 + Math.random() * 2000,
      rotation: new Animated.Value(0),
      translateY: new Animated.Value(-50),
      opacity: new Animated.Value(0),
    }));
    setConfetti(pieces);

    const animations: Animated.CompositeAnimation[] = [];
    pieces.forEach((p) => {
      const spin = Animated.loop(Animated.timing(p.rotation, { toValue: 1, duration: 1200, useNativeDriver: true }));
      const fall = Animated.timing(p.translateY, { toValue: height + 50, duration: p.duration, useNativeDriver: true });
      const fade = Animated.timing(p.opacity, { toValue: 0.9, duration: 300, useNativeDriver: true });
      const seq = Animated.sequence([Animated.delay(p.delay), Animated.parallel([fade, fall, spin])]);
      animations.push(seq);
      seq.start();
    });

    return () => animations.forEach(a => a.stop());
  }, []);

  const handleCreateAccount = () => {
    router.push('/onboarding/CreateAccount');
  };

  const handleContinue = () => {
    // Navigate to anonymous consent screen first
    router.push('/onboarding/anonymous-consent');
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <AnimatedBackground variant="variant2" />

      {/* Confetti */}
      <View style={styles.confettiLayer} pointerEvents="none">
        {confetti.map((p) => (
          <Animated.View key={p.id} style={[styles.confetti, { left: p.x, opacity: p.opacity, backgroundColor: Math.random() > 0.5 ? '#F49B9B' : '#FFFFFF', transform: [{ translateY: p.translateY }, { rotate: p.rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]} />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
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
            <View style={[styles.progressBarFill, { width: 300 }]} />
          </View>
        </View>

        {/* Mimi */}
        <View style={styles.mimiContainer}>
          <Image source={require('../../assets/Mimi_karakters/1_enthousiast_whiter.png')} style={styles.mimiImage} resizeMode="contain" />
        </View>

        {/* Text */}
        <View style={styles.content}> 
          <Text style={styles.title}>Goed gedaan!</Text>
          <Text style={styles.subtitle}>Je persoonlijke profiel is klaar.</Text>
          <Text style={styles.description}>Maak een account aan om je gegevens veilig op te slaan en persoonlijke adviezen te ontvangen.</Text>

          <View style={styles.benefitsCard}>
            {/* Nu gratis (pilot) ribbon */}
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>Nu gratis (pilot)</Text>
            </View>

            <Text style={styles.benefitsTitle}>Met een account kun je:</Text>
            <View style={styles.benefitRow}><ChartIcon /><Text style={styles.benefitText}>Veilig-voeden momenten berekenen en meldingen ontvangen</Text></View>
            <View style={styles.benefitRow}><BottleIcon /><Text style={styles.benefitText}>Afgekolfde melk plannen en voorraad bijhouden</Text></View>
            <View style={styles.benefitRow}><CloudIcon /><Text style={styles.benefitText}>Je data synchroniseren tussen apparaten</Text></View>
          </View>
        </View>
      </SafeAreaView>

      {/* CTAs */}
      <TouchableOpacity style={styles.primaryButton} onPress={handleCreateAccount}>
        <Text style={styles.primaryButtonText}>Maak account aan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={handleContinue}>
        <Text style={styles.secondaryButtonText}>Ga door zonder account</Text>
      </TouchableOpacity>
      <Text style={styles.nudgeText}>Account aanmaken geeft je backups, synchronisatie en persoonlijke meldingen. Je data is van jou. We verkopen geen persoonsgegevens.</Text>

      <View style={styles.bottomLine} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F3', position: 'relative', width, height },
  safeArea: { flex: 1 },
  confettiLayer: { position: 'absolute', width, height, zIndex: 20 },
  confetti: { position: 'absolute', width: 10, height: 10, borderRadius: 5, shadowColor: '#F49B9B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  mimiContainer: { position: 'absolute', left: width * 0.25, right: width * 0.25, top: 100 + (height * 0.05), height: 200, alignItems: 'center', justifyContent: 'center' },
  mimiImage: { width: '100%', height: '100%' },
  content: { position: 'absolute', top: height * 0.38, left: 0, right: 0, paddingHorizontal: 20, alignItems: 'center' },
  title: { fontFamily: 'Quicksand', fontWeight: '700', fontSize: 30, lineHeight: 38, textAlign: 'center', color: '#4B3B36', marginBottom: 8 },
  subtitle: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 17, lineHeight: 24, textAlign: 'center', color: '#7A6C66', marginBottom: 12 },
  description: { fontFamily: 'Poppins', fontWeight: '300', fontSize: 14, lineHeight: 20, textAlign: 'center', color: '#8E8B88', maxWidth: 320, marginBottom: 20 },
  benefitsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, shadowColor: '#F49B9B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F9F4F0', position: 'relative', overflow: 'hidden' },
  ribbon: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F49B9B',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 0,
    transform: [{ rotate: '45deg' }, { translateX: 25 }, { translateY: -10 }],
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  ribbonText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 11,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  benefitsTitle: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 14, color: '#4B3B36', marginBottom: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  benefitText: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 13, lineHeight: 20, color: '#7A6C66', flex: 1 },
  primaryButton: { position: 'absolute', left: 20, right: 20, height: 56, bottom: 140, backgroundColor: '#F49B9B', borderRadius: 38, justifyContent: 'center', alignItems: 'center', shadowColor: '#F49B9B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  primaryButtonText: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 17, lineHeight: 26, textAlign: 'center', color: '#FFFFFF' },
  secondaryButton: { position: 'absolute', left: 20, right: 20, height: 48, bottom: 90, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 15, lineHeight: 22, textAlign: 'center', color: '#8E8B88' },
  nudgeText: { position: 'absolute', bottom: 42, left: 32, right: 32, fontFamily: 'Poppins', fontWeight: '300', fontSize: 11, lineHeight: 16, textAlign: 'center', color: '#A8A5A2' },
  bottomLine: { position: 'absolute', width: 143, height: 5, left: (width - 143) / 2, bottom: 14, backgroundColor: '#E6E6E6' },
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
});


