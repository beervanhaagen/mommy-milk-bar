import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/usp-1');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Fixed header with progress bar */}
      <View style={styles.fixedHeader}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: 60 }]} />
        </View>
      </View>

      {/* Mimi Character */}
      <View style={styles.mimiContainer}>
        <Image
          source={require('../../assets/Mimi_karakters/2_mimi_happy_2.png')}
          style={styles.mimiImage}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Welkom bij{'\n'}Mama Milk Bar
      </Text>

      {/* Description */}
      <Text style={styles.description}>
        Geniet van een glas wijn.{'\n'}
        Voed met vertrouwen.
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Voor mama's die borstvoeding geven én af en toe een drankje willen.
      </Text>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Laten we beginnen</Text>
      </TouchableOpacity>

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
  mimiContainer: {
    position: 'absolute',
    left: width * 0.2694,
    right: width * 0.2742,
    top: 150,
    height: 244.53,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mimiImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: height * 0.55,
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 42,
    textAlign: 'center',
    color: '#4B3B36',
  },
  description: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: height * 0.67,
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: '#F49B9B',
  },
  subtitle: {
    position: 'absolute',
    width: 320,
    left: (width - 320) / 2,
    top: height * 0.75,
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
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
});
