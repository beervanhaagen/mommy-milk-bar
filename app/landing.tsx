import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/state/store";
import { useAuth } from "../src/contexts/AuthContext";

const { width, height } = Dimensions.get('window');

export default function Landing() {
  const router = useRouter();
  const { settings } = useStore();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    // If authenticated and onboarded, go to app
    if (isAuthenticated && settings.hasCompletedOnboarding) {
      router.replace('/(tabs)');
    } else {
      // Not authenticated or onboarding not complete - start onboarding
      router.push('/onboarding/welcome');
    }
  };

  return (
    <View style={styles.container}>
      {/* Mimi Character */}
      <View style={styles.mimiContainer}>
        <Image 
          source={require('../assets/Mimi_karakters/2_mimi_happy_2.png')} 
          style={styles.mimiImage}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Welkom bij Mama Milk Bar
      </Text>

      {/* Description */}
      <Text style={styles.description}>
        De app voor mama's die borstvoeding geven én af en toe een glas willen drinken.
      </Text>

      {/* Get Started Button */}
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Aan de slag</Text>
      </TouchableOpacity>

      {/* Login Link */}
      {!isAuthenticated && (
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginLinkText}>Al een account? Log in</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Line */}
      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F49B9B',
    position: 'relative',
    width: width,
    height: height,
  },
  mimiContainer: {
    position: 'absolute',
    left: width * 0.2681,
    right: width * 0.2656,
    top: 188.73,
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
    left: width * 0.1643,
    right: width * 0.1618,
    top: height * 0.596,
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 41,
    textAlign: 'center',
    color: '#FFFCF4',
  },
  description: {
    position: 'absolute',
    width: 320,
    left: (width - 320) / 2,
    top: height * 0.702,
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFF8F2',
  },
  button: {
    position: 'absolute',
    width: 374,
    height: 63,
    left: (width - 374) / 2,
    top: 769,
    backgroundColor: '#E47C7C',
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
  loginLink: {
    position: 'absolute',
    top: 850,
    alignSelf: 'center',
  },
  loginLinkText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  bottomLine: {
    position: 'absolute',
    width: 143,
    height: 5,
    left: (width - 143) / 2,
    top: height * 0.984,
    backgroundColor: '#E6E6E6',
  },
});
