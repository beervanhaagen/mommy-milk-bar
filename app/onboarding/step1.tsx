import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

export default function Step1() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/step2');
  };

  return (
    <View style={styles.container}>
      {/* SVG Background Shape */}
      <Svg 
        width={423} 
        height={504} 
        style={styles.onboardingShape}
        viewBox="0 0 414 504"
        preserveAspectRatio="xMidYMid meet"
      >
        <Path 
          d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z" 
          fill="#FFE2D8"
        />
      </Svg>

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
      <Text style={styles.title}>Genieten van een glas met controle</Text>
      
      {/* Description */}
      <Text style={styles.description}>De app helpt je om verantwoord te voeden, zelfs na een glas wijn.</Text>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Volgende</Text>
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
    width: 423,
    height: 504,
    left: -3,
    top: 0,
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
    width: 50,
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
    width: 328,
    left: (width - 328) / 2,
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
