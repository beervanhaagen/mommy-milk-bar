import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../src/state/store";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions, markCompleted } = useStore();
  const [now, setNow] = useState(Date.now());
  const router = useRouter();

  const session = sessions.find(s => s.id === id);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sessie niet gevonden</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>Naar home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const remainingMs = Math.max(0, session.predictedSafeAt - now);
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const isSafe = remainingMs === 0;

  const handleSetReminder = () => {
    Alert.alert(
      "Herinnering ingesteld",
      "We laten je weten wanneer het waarschijnlijk veilig is om te voeden.",
      [{ text: "OK" }]
    );
  };

  const handleMarkSafe = () => {
    markCompleted(session.id);
    Alert.alert(
      "Gemarkeerd als veilig",
      "Top! Je kunt nu veilig voeden.",
      [{ text: "OK", onPress: () => router.push('/') }]
    );
  };

  return (
    <View style={styles.container}>
      {/* SVG Background Shape */}
      <Svg
        width={width}
        height={height * 0.4}
        style={styles.svgBackground}
        viewBox="0 0 414 504"
        preserveAspectRatio="xMinYMin slice"
      >
        <Path
          d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z"
          fill="#FFE2D8"
        />
      </Svg>

      <View style={styles.content}>
        {/* Mimi Character */}
        <View style={styles.characterContainer}>
          <Image 
            source={require('../assets/Mimi_karakters/2_mimi_happy_2.png')} 
            style={styles.mimiImage}
            resizeMode="contain"
          />
        </View>
        {isSafe ? (
          <View style={styles.safeContainer}>
            <Text style={styles.safeText}>Veilig volgens berekening</Text>
            <Text style={styles.safeSubtext}>Je kunt waarschijnlijk veilig voeden</Text>
            <Text style={styles.disclaimer}>Dit is een indicatie. Raadpleeg bij twijfel een professional.</Text>
            <TouchableOpacity style={styles.safeButton} onPress={handleMarkSafe}>
              <Text style={styles.safeButtonText}>Markeer als veilig</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.countdownContainer}>
            <Text style={styles.etaLabel}>Waarschijnlijk veilig om</Text>
            <Text style={styles.etaTime}>
              {new Date(session.predictedSafeAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            <Text style={styles.countdown}>
              {hours > 0 ? `${hours}u ` : ''}{minutes}m nog te gaan
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSetReminder}>
            <Text style={styles.primaryButtonText}>Herinnering instellen</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/')}>
            <Text style={styles.secondaryButtonText}>Nieuwe sessie</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Wat nu te doen:</Text>
          <Text style={styles.tip}>🍼 Gebruik bewaarde melk</Text>
          <Text style={styles.tip}>💧 Kolven indien nodig</Text>
          <Text style={styles.tip}>⏱ Wacht tot afbraak voltooid is</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 200,
  },
  characterContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  mimiImage: {
    width: 180,
    height: 210,
  },
  safeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  safeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#27ae60',
    marginBottom: 8,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  safeSubtext: {
    fontSize: 18,
    color: '#7A6C66',
    marginBottom: 8,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#8E8B88',
    marginBottom: 20,
    fontFamily: 'Poppins',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  safeButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  safeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  etaLabel: {
    fontSize: 18,
    color: '#7A6C66',
    marginBottom: 8,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  etaTime: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4B3B36',
    marginBottom: 8,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  countdown: {
    fontSize: 20,
    color: '#F49B9B',
    fontWeight: '600',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  actions: {
    marginBottom: 40,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#F49B9B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#F49B9B',
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#F49B9B',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  tips: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3B36',
    marginBottom: 12,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  tip: {
    fontSize: 14,
    color: '#7A6C66',
    marginBottom: 4,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  button: {
    backgroundColor: '#F49B9B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});
