import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../src/state/store";
import Svg, { Path } from "react-native-svg";

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
  const { updateSettings } = useStore();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
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

  const handleStart = () => {
    // Mark onboarding as completed
    updateSettings({ hasCompletedOnboarding: true });
    router.push('/(tabs)');
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Background shape */}
      <Svg width={width} height={504} style={styles.onboardingShape} viewBox="0 0 414 504" preserveAspectRatio="xMinYMin slice">
        <Path d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z" fill="#FFE2D8" />
      </Svg>

      {/* Confetti */}
      <View style={styles.confettiLayer} pointerEvents="none">
        {confetti.map((p) => (
          <Animated.View key={p.id} style={[styles.confetti, { left: p.x, opacity: p.opacity, backgroundColor: Math.random() > 0.5 ? '#F49B9B' : '#FFFFFF', transform: [{ translateY: p.translateY }, { rotate: p.rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]} />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Mimi */}
        <View style={styles.mimiContainer}>
          <Image source={require('../../assets/Mimi_karakters/1_enthousiast_whiter.png')} style={styles.mimiImage} resizeMode="contain" />
        </View>

        {/* Text */}
        <View style={styles.content}>
          <Text style={styles.title}>Welkom bij Mommy Milk Bar</Text>
          <Text style={styles.subtitle}>Je account is aangemaakt en je profiel is opgeslagen.</Text>
          <Text style={styles.body}>We hebben je antwoorden bewaard. Je kunt ze altijd aanpassen in je instellingen.</Text>
        </View>
      </SafeAreaView>

      {/* CTA */}
      <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
        <Text style={styles.primaryButtonText}>Start met Mommy Milk Bar</Text>
      </TouchableOpacity>

      <View style={styles.bottomLine} />
    </Animated.View>
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
