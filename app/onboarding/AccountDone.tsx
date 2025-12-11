import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../src/state/store";
import { syncAllDataToSupabase } from "../../src/services/profile.service";
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

export default function AccountDone() {
  const router = useRouter();

  // Select only the pieces of state we need to avoid undefined helpers
  const profile = useStore((state) => state.profile);
  const babies = useStore((state) => state.babies);
  const updateSettings = useStore((state) => state.updateSettings);

  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const pieces: ConfettiPiece[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      delay: Math.random() * 1000,
      duration: 2500 + Math.random() * 1500,
      rotation: new Animated.Value(0),
      translateY: new Animated.Value(-50),
      opacity: new Animated.Value(0),
    }));
    setConfetti(pieces);

    const animations: Animated.CompositeAnimation[] = [];
    pieces.forEach((p) => {
      const spin = Animated.loop(Animated.timing(p.rotation, { toValue: 1, duration: 1000, useNativeDriver: true }));
      const fall = Animated.timing(p.translateY, { toValue: height + 50, duration: p.duration, useNativeDriver: true });
      const fade = Animated.timing(p.opacity, { toValue: 0.8, duration: 300, useNativeDriver: true });
      const seq = Animated.sequence([Animated.delay(p.delay), Animated.parallel([fade, fall, spin])]);
      animations.push(seq);
      seq.start();
    });

    return () => animations.forEach(a => a.stop());
  }, []);

  const handleStart = async () => {
    setIsSyncing(true);

    try {
      // Sync all onboarding data (profile + babies) to Supabase before entering app
      await syncAllDataToSupabase(profile as any, babies as any);

      // Mark onboarding as completed
      updateSettings({ hasCompletedOnboarding: true });

      // Navigate to main app
      router.push('/(tabs)');
    } catch (error) {
      console.error('Sync error (non-critical):', error);
      // Continue anyway - data is saved locally and will sync later
      updateSettings({ hasCompletedOnboarding: true });
      router.push('/(tabs)');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <AnimatedBackground variant="variant1" />

      {/* Confetti */}
      <View style={styles.confettiLayer} pointerEvents="none">
        {confetti.map((p) => (
          <Animated.View key={p.id} style={[styles.confetti, { left: p.x, opacity: p.opacity, backgroundColor: Math.random() > 0.5 ? '#F49B9B' : '#FFFFFF', transform: [{ translateY: p.translateY }, { rotate: p.rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]} />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" fill="#F49B9B" />
          </Svg>
        </TouchableOpacity>
        {/* Mimi */}
        <View style={styles.mimiContainer}>
          <Image source={require('../../assets/Mimi_karakters/1_enthousiast_whiter.png')} style={styles.mimiImage} resizeMode="contain" />
        </View>

        {/* Text */}
        <View style={styles.content}>
          <Text style={styles.title}>Welkom bij Mommy Milk Bar</Text>
          <Text style={styles.subtitle}>Je account is aangemaakt en je profiel is opgeslagen.</Text>
          <Text style={styles.body}>We hebben je antwoorden bewaard. Je kunt ze altijd aanpassen in je profiel.</Text>
        </View>
      </SafeAreaView>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.primaryButton, isSyncing && styles.primaryButtonDisabled]}
        onPress={handleStart}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={[styles.primaryButtonText, { marginLeft: 12 }]}>Gegevens opslaan...</Text>
          </View>
        ) : (
          <Text style={styles.primaryButtonText}>Start met Mommy Milk Bar</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomLine} />
    </Animated.View>
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
  confettiLayer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 20,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  mimiContainer: {
    position: 'absolute',
    left: width * 0.25,
    right: width * 0.25,
    top: 120,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mimiImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'absolute',
    top: height * 0.45,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    color: '#7A6C66',
    marginBottom: 16,
  },
  body: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#8E8B88',
    maxWidth: 320,
  },
  primaryButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 56,
    bottom: 100,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 17,
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
