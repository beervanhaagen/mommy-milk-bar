import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

export default function Step2() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/step3');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="variant2" />

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View style={styles.progressBarFill} />
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
      <Text style={styles.title}>Jij geniet, wij houden de tijd bij</Text>
      
      {/* Description */}
      <Text style={styles.description}>Timers en meldingen helpen je om precies te weten wanneer je weer kunt voeden.</Text>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Doorgaan</Text>
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
    width: 100, // 2nd step - more progress
    height: 4,
    backgroundColor: '#F49B9B',
    borderRadius: 2,
  },
  mimiContainer: {
    position: 'absolute',
    height: 244.53,
    left: width * 0.2694,
    right: width * 0.2742,
    top: 190.73,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mimiImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    position: 'absolute',
    left: width * 0.1618,
    right: width * 0.1643,
    top: height * 0.596,
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 41,
    textAlign: 'center',
    color: '#4B3B36',
  },
  description: {
    position: 'absolute',
    width: 340,
    left: (width - 340) / 2,
    top: height * 0.702,
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#8E8B88',
  },
  button: {
    position: 'absolute',
    width: 374,
    height: 63,
    left: (width - 374) / 2,
    top: 769,
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
  bottomLine: {
    position: 'absolute',
    width: 143,
    height: 5,
    left: (width - 143) / 2,
    top: 882,
    backgroundColor: '#E6E6E6',
  },
});
