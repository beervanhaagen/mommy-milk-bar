import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/state/store";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

export default function PlanAhead() {
  const router = useRouter();
  const { createSession } = useStore();
  const [drinks, setDrinks] = useState(1);
  const [drinkTime, setDrinkTime] = useState(new Date());

  const handleCalculate = () => {
    const sessionId = createSession({
      drinks,
      startedAt: drinkTime.getTime(),
      mode: 'planAhead'
    });
    router.push(`/result?id=${sessionId}`);
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

        <Text style={styles.title}>📅 Plan Ahead</Text>
        <Text style={styles.subtitle}>When will you have your first drink?</Text>
        <View style={styles.drinksContainer}>
          <Text style={styles.label}>How many drinks?</Text>
          <View style={styles.drinksButtons}>
            {[1, 2, 3, 4].map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.drinkButton, drinks === count && styles.drinkButtonActive]}
                onPress={() => setDrinks(count)}
              >
                <Text style={[styles.drinkButtonText, drinks === count && styles.drinkButtonTextActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.label}>Drink time</Text>
          <Text style={styles.timeDisplay}>
            {drinkTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <TouchableOpacity style={styles.timeButton}>
            <Text style={styles.timeButtonText}>Change Time</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleCalculate}>
          <Text style={styles.primaryButtonText}>Calculate Safe Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/')}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF4',
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
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#4B3B36',
    marginBottom: 8,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6C66',
    textAlign: 'center',
    fontFamily: 'Poppins',
    marginBottom: 40,
  },
  drinksContainer: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 18,
    color: '#7A6C66',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  drinksButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
  },
  drinkButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drinkButtonActive: {
    backgroundColor: '#F49B9B',
    borderColor: '#E88A8A',
  },
  drinkButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7A6C66',
    fontFamily: 'Poppins',
  },
  drinkButtonTextActive: {
    color: '#FFFFFF',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4B3B36',
    marginBottom: 16,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F49B9B',
    backgroundColor: '#FFFCF4',
  },
  timeButtonText: {
    color: '#F49B9B',
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '500',
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
  },
  secondaryButtonText: {
    color: '#F49B9B',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});
