import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/state/store";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const { updateSettings } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));

  const steps = [
    {
      title: "Genieten van een glas met controle",
      description: "De app helpt je om verantwoord te voeden, zelfs na een glas wijn.",
      mimiAsset: require('../assets/Mimi_karakters/2_mimi_happy_2.png')
    },
    {
      title: "Jij geniet, wij houden de tijd bij",
      description: "Timers en meldingen helpen je om precies te weten wanneer je weer kunt voeden.",
      mimiAsset: require('../assets/Mimi_karakters/2_mimi_happy_2.png')
    },
    {
      title: "Minder rekenen, meer rust",
      description: "Mimi rekent voor je uit wanneer jouw melk weer veilig is.",
      mimiAsset: require('../assets/Mimi_karakters/2_mimi_happy_2.png')
    },
    {
      title: "Wees gerust, Mimi weet raadt",
      description: "Mimi vertelt precies wat je kunt doen: van wachten tot afkolven.",
      mimiAsset: require('../assets/Mimi_karakters/2_mimi_happy_2.png')
    },
    {
      title: "Duidelijkheid bij teveel glazen wijn",
      description: "'Pump, Dump en Door?' of stoppen en straks weer voeden.",
      mimiAsset: require('../assets/Mimi_karakters/7_Closed_mimi_png.png'),
      isWarning: true
    },
    {
      title: "Mommy Milk Bar is weer open",
      description: "Mimi laat je weten wanneer het veilig is om weer te voeden.",
      mimiAsset: require('../assets/Mimi_karakters/Milkbar_open_1.png'),
      isReinforcement: true
    },
    {
      title: "Hoe werkt Mimi?",
      description: "Mimi verandert op basis van de countdown",
      mimiAsset: require('../assets/Mimi_karakters/2_mimi_happy_2.png'),
      isMimiLogic: true
    },
    {
      title: "Ervaar de tool",
      description: "Zie hoe Mimi je helpt bij het plannen van je avond",
      mimiAsset: require('../assets/Mimi_karakters/2_mimi_happy_2.png'),
      isDemo: true
    }
  ];

  const handleNext = () => {
    if (currentStepData.isMimiLogic) {
      // Navigate to Mimi logic screen
      router.push('/onboarding/mimi-logic');
    } else if (currentStepData.isDemo) {
      // Skip demo screen, go directly to survey
      router.push('/onboarding/survey-names');
    } else if (currentStep < steps.length - 1) {
      // Animate slide to next step
      Animated.timing(slideAnim, {
        toValue: -(currentStep + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete, go to home
      updateSettings({ hasCompletedOnboarding: true });
      router.replace('/');
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      {/* SVG Background Shape - Fixed */}
      <Svg 
        width={width} 
        height={504} 
        style={styles.onboardingShape}
        viewBox="0 0 414 504"
        preserveAspectRatio="xMinYMin slice"
      >
        <Path 
          d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z" 
          fill="#FFE2D8"
        />
      </Svg>

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
          <View 
            style={[
              styles.progressBarFill, 
              { width: 19 + (currentStep * 19) } // Progressive fill for 8 steps: 6%, 12%, 19%, 25%, 31%, 38%, 44%, 50%
            ]} 
          />
        </View>
      </View>

      {/* Mimi Character - Fixed */}
      <View style={[
        styles.mimiContainer,
        currentStepData.isWarning && styles.mimiContainerWarning,
        currentStepData.isReinforcement && styles.mimiContainerReinforcement
      ]}>
        <Image 
          source={currentStepData.mimiAsset} 
          style={[
            styles.mimiImage,
            currentStepData.isWarning && styles.mimiImageWarning,
            currentStepData.isReinforcement && styles.mimiImageReinforcement
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Animated Content Container */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <Text style={[
              styles.title,
              step.isWarning && styles.titleWarning,
              step.isReinforcement && styles.titleReinforcement
            ]}>{step.title}</Text>
            <Text style={[
              styles.description,
              step.isWarning && styles.descriptionWarning,
              step.isReinforcement && styles.descriptionReinforcement
            ]}>{step.description}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Continue Button - Fixed */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentStep < steps.length - 1 ? 'Doorgaan' : 'Voltooien'}
        </Text>
      </TouchableOpacity>

      {/* Bottom Line - Fixed */}
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
  mimiContainerWarning: {
    height: 316.84,
    left: width * 0.2536,
    right: width * 0.2517,
    top: 116,
  },
  mimiImageWarning: {
    width: '100%',
    height: '100%',
  },
  mimiContainerReinforcement: {
    width: 238.81,
    height: 307.33,
    left: (width - 238.81) / 2 + 1.41,
    top: 127,
  },
  mimiImageReinforcement: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    width: width * 8, // Total width for all 8 steps
  },
  stepContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: height * 0.596,
    paddingBottom: 200,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 41,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 20,
  },
  description: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#8E8B88',
    maxWidth: 340,
  },
  titleWarning: {
    // Same as default title
  },
  descriptionWarning: {
    maxWidth: 256,
    fontWeight: '300',
  },
  titleReinforcement: {
    // Same as default title
  },
  descriptionReinforcement: {
    maxWidth: 340,
    fontWeight: '400',
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
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
