import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import Slider from '@react-native-community/slider';
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

export default function HowItWorks() {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(180); // In minutes, 0-180 (3 hours)

  // Function to get Mimi state based on time remaining
  const getMimiState = (minutes: number) => {
    if (minutes === 0) {
      return {
        title: 'Milk Bar open!',
        subtitle: 'Veilig om te voeden',
        mimiAsset: require('../../assets/Mimi_karakters/Milkbar_open_1.png'),
      };
    } else if (minutes < 60) {
      return {
        title: 'Bijna open!',
        subtitle: 'Nog maar even wachten',
        mimiAsset: require('../../assets/Mimi_karakters/2_mimi_happy_2.png'),
      };
    } else if (minutes < 120) {
      return {
        title: 'Nog niet open',
        subtitle: 'Even geduld nog',
        mimiAsset: require('../../assets/Mimi_karakters/4_nogniet_2.png'),
      };
    } else {
      return {
        title: 'Milk Bar gesloten',
        subtitle: 'Nog even wachten',
        mimiAsset: require('../../assets/Mimi_karakters/7_Closed_mimi_png.png'),
      };
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const currentState = getMimiState(timeRemaining);

  const handleNext = () => {
    router.push('/onboarding/essential-info');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground variant="variant2" />

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
          <View style={[styles.progressBarFill, { width: 180 }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Probeer het zelf</Text>
        <Text style={styles.subtitle}>Beweeg de slider om te zien hoe Mimi verandert</Text>

        {/* Combined Mimi and Countdown Card (like home screen) */}
        <View style={styles.combinedCard}>
          {/* Mimi Character - Dynamic */}
          <View style={styles.mimiContainer}>
            <Image
              source={currentState.mimiAsset}
              style={styles.mimiImage}
              resizeMode="contain"
            />
          </View>

          {/* Status under Mimi */}
          <View style={styles.statusContainer}>
            <Text style={styles.stateTitle}>
              {currentState.title}
            </Text>
            <Text style={styles.countdown}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.stateSubtitle}>{currentState.subtitle}</Text>
          </View>
        </View>

        {/* Interactive Card with Slider */}
        <View style={styles.interactiveCard}>
          {/* Slider with Time Annotations */}
          <View style={styles.sliderContainer}>
            <Text style={styles.cardTitle}>Tijd sinds laatste drankje</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={180}
              step={1}
              value={180 - timeRemaining}
              onValueChange={(value) => setTimeRemaining(180 - value)}
              minimumTrackTintColor="#E6E6E6"
              maximumTrackTintColor="#F49B9B"
              thumbTintColor="#F49B9B"
            />

            {/* Time Annotations */}
            <View style={styles.timeAnnotations}>
              <Text style={styles.annotationLabel}>Nu</Text>
              <Text style={styles.annotationLabel}>1u</Text>
              <Text style={styles.annotationLabel}>2u</Text>
              <Text style={styles.annotationLabel}>3u</Text>
            </View>
          </View>
        </View>
      </View>

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
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 20,
  },
  combinedCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FA9795',
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mimiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    backgroundColor: '#FEDFE0',
    paddingTop: 20,
  },
  mimiImage: {
    width: 120,
    height: 140,
  },
  statusContainer: {
    backgroundColor: '#FA9795',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  stateTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  countdown: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 2,
  },
  stateSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  interactiveCard: {
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
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 16,
  },
  sliderContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeAnnotations: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 5,
  },
  annotationLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#7A6C66',
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
