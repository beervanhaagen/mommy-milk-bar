import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import Slider from '@react-native-community/slider';
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

type MimiState = 'open' | 'almost' | 'not_yet' | 'closed';

export default function MimiLogic() {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(180); // In minutes, 0-180 (3 hours)

  // Function to get Mimi state based on time remaining
  const getMimiState = (minutes: number) => {
    if (minutes === 0) {
      return {
        title: 'Milk Bar open!',
        subtitle: 'Veilig om te voeden',
        mimiAsset: require('../../assets/Mimi_karakters/Milkbar_open_1.png'),
        color: '#27ae60',
      };
    } else if (minutes < 60) {
      return {
        title: 'Bijna open!',
        subtitle: 'Nog maar even wachten',
        mimiAsset: require('../../assets/Mimi_karakters/2_mimi_happy_2.png'),
        color: '#F4C542',
      };
    } else if (minutes < 120) {
      return {
        title: 'Nog niet open',
        subtitle: 'Even geduld nog',
        mimiAsset: require('../../assets/Mimi_karakters/4_nogniet_2.png'),
        color: '#F4A460',
      };
    } else {
      return {
        title: 'Milk Bar gesloten',
        subtitle: 'Nog lang wachten',
        mimiAsset: require('../../assets/Mimi_karakters/7_Closed_mimi_png.png'),
        color: '#E47C7C',
      };
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  const currentState = getMimiState(timeRemaining);

  const handleNext = () => {
    // Skip survey-names - go directly to survey-you (privacy-first approach)
    router.replace('/onboarding/survey-you');
  };

  return (
    <View style={styles.container}>
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
          <View style={[styles.progressBarFill, { width: 168 }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Hoe werkt Mommy Milk Bar?</Text>
        <Text style={styles.subtitle}>Mimi verandert op basis van de countdown</Text>

        {/* Mimi Character - Dynamic */}
        <View style={styles.mimiContainer}>
          <Image 
            source={currentState.mimiAsset} 
            style={styles.mimiImage}
            resizeMode="contain"
          />
        </View>

        {/* State Text - Subtle under Mimi */}
        <Text style={[styles.stateTitle, { color: currentState.color }]}>
          {currentState.title}
        </Text>
        <Text style={styles.stateSubtitle}>
          {currentState.subtitle}
        </Text>

        {/* Countdown Display */}
        <Text style={styles.countdown}>{formatTime(timeRemaining)}</Text>

        {/* Interactive Card with Slider */}
        <View style={styles.interactiveCard}>
          <Text style={styles.cardTitle}>Beweeg de slider</Text>
          
          {/* Slider with Time Annotations */}
          <View style={styles.sliderContainer}>
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
              <View style={styles.annotation}>
                <Text style={styles.annotationLabel}>3u+</Text>
              </View>
              <View style={styles.annotation}>
                <Text style={styles.annotationLabel}>2u</Text>
              </View>
              <View style={styles.annotation}>
                <Text style={styles.annotationLabel}>1u</Text>
              </View>
              <View style={styles.annotation}>
                <Text style={styles.annotationLabel}>0u</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Doorgaan</Text>
      </TouchableOpacity>

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
  content: {
    flex: 1,
    marginTop: 100,
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
    marginBottom: 30,
  },
  mimiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    marginTop: 20,
    marginBottom: 20,
  },
  mimiImage: {
    width: 180,
    height: 220,
  },
  stateTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 4,
  },
  stateSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 16,
  },
  countdown: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 30,
  },
  interactiveCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 20,
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
    marginTop: 10,
    paddingHorizontal: 5,
  },
  annotation: {
    alignItems: 'center',
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
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
});

