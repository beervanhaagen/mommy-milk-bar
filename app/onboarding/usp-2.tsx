import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

// Choice/Options Icon (forked path)
const ChoiceIcon = () => (
  <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2v8m0 0l-4 4m4-4l4 4"
      stroke="#F49B9B"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 14v6M16 14v6"
      stroke="#F49B9B"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={8} cy={20} r={2} fill="#F49B9B" />
    <Circle cx={16} cy={20} r={2} fill="#F49B9B" />
  </Svg>
);

export default function USP2() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/what-is-mmb');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground variant="variant4" />

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
          <View style={[styles.progressBarFill, { width: 90 }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Mimi Character */}
        <View style={styles.mimiIconContainer}>
          <Image
            source={require('../../assets/Mimi_karakters/2_mimi_happy_2.png')}
            style={styles.mimiIcon}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Op jouw manier</Text>

        {/* Description */}
        <Text style={styles.description}>
          Plan vooruit of log direct. Mimi past zich aan jouw situatie aan.
        </Text>

        {/* Two Options Cards */}
        <View style={styles.optionsContainer}>
          {/* Option 1: Plan Ahead */}
          <View style={styles.optionCard}>
            <View style={styles.optionIconCircle}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"
                  fill="#F49B9B"
                />
              </Svg>
            </View>
            <Text style={styles.optionTitle}>Plan vooruit</Text>
            <Text style={styles.optionText}>
              Ga je vanavond uit? Log je drankjes en zie direct wanneer je weer veilig kunt voeden.
            </Text>
          </View>

          {/* Option 2: Log Now */}
          <View style={styles.optionCard}>
            <View style={styles.optionIconCircle}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"
                  fill="#F49B9B"
                />
              </Svg>
            </View>
            <Text style={styles.optionTitle}>Log direct</Text>
            <Text style={styles.optionText}>
              Net een drankje op? Voeg het toe en de countdown start meteen.
            </Text>
          </View>
        </View>

        <Text style={styles.subtext}>
          Beide methodes gebaseerd op medische richtlijnen
        </Text>
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
    marginTop: 120,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mimiIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mimiIcon: {
    width: 100,
    height: 120,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 42,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#8E8B88',
    maxWidth: 340,
    marginBottom: 32,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 32,
  },
  optionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    alignItems: 'center',
  },
  optionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 8,
  },
  optionText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
  },
  subtext: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#F49B9B',
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
