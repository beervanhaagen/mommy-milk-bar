import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Image, Animated, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/state/store';
import { drinkTypes } from '../../src/data/drinkTypes';
import { DrinkLogTable } from '../../src/components/DrinkLogTable';
import { CountdownCard } from '../../src/components/CountdownCard';
import { CustomDrinkInput } from '../../src/components/CustomDrinkInput';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Use imported drink types

export default function Drinks() {
  const router = useRouter();
  const { getCurrentSession, getProfile, dispatchDrinkAction } = useStore();
  const [selectedDrink, setSelectedDrink] = useState('wine');
  const [quantity, setQuantity] = useState(1);
  const [customAlcohol, setCustomAlcohol] = useState({ percentage: 12, volume: 150 });

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAnim] = useState(new Animated.Value(0));
  const [mimiScale] = useState(new Animated.Value(0));
  const [confettiFall] = useState(new Animated.Value(0));

  const currentSession = getCurrentSession();
  const profile = getProfile();

  const handleLogDrink = () => {
    if (!selectedDrink) return;

    // Start session if none exists
    if (!currentSession) {
      dispatchDrinkAction({ type: 'START_SESSION' });
    }

    // Calculate custom drink values if needed
    let unitsPerGlass = drinkTypes[selectedDrink].unitsPerGlass;
    let gramsPerUnit = drinkTypes[selectedDrink].gramsPerUnit;

    if (selectedDrink === 'other') {
      // Calculate standard drinks for custom drink
      const alcoholGrams = (customAlcohol.volume * customAlcohol.percentage * 0.789) / 100;
      unitsPerGlass = alcoholGrams / 10; // Convert to standard drinks
    }

    // Add drink entry
    dispatchDrinkAction({
      type: 'ADD_ENTRY',
      payload: {
        typeId: selectedDrink,
        glasses: quantity,
        unitsPerGlass: unitsPerGlass,
        gramsPerUnit: gramsPerUnit,
      }
    });

    // Show success screen
    Vibration.vibrate(100);
    setShowSuccess(true);

    // Geen fade - direct zichtbaar
    successAnim.setValue(1);

    // Reset animaties voor elke keer
    mimiScale.setValue(0);
    confettiFall.setValue(0);

    // Mimi bounce animation
    Animated.sequence([
      Animated.spring(mimiScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(mimiScale, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(mimiScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti - later en 20% sneller (2800ms i.p.v. 3500ms)
    setTimeout(() => {
      Animated.timing(confettiFall, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Auto-navigate naar home na 2.5 seconden
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/');
    }, 2500);
  };

  const handleCustomAlcoholChange = (percentage: number, volume: number) => {
    setCustomAlcohol({ percentage, volume });
  };

  const handleUndoLast = () => {
    dispatchDrinkAction({ type: 'UNDO_LAST' });
  };

  const handleEndSession = () => {
    dispatchDrinkAction({ type: 'END_SESSION' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Drankje loggen</Text>
          <Text style={styles.subtitle}>Selecteer je drankje en hoeveelheid</Text>
        </View>

        {/* Drink Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wat drink je?</Text>
          <View style={styles.drinkGrid}>
            {Object.values(drinkTypes).map((drink) => {
              const IconComponent = drink.icon;
              return (
                <TouchableOpacity
                  key={drink.id}
                  style={[
                    styles.drinkCard,
                    selectedDrink === drink.id && styles.drinkCardSelected
                  ]}
                  onPress={() => setSelectedDrink(drink.id)}
                >
                  <IconComponent size={32} />
                  <Text style={styles.drinkName}>{drink.label}</Text>
                  <Text style={[styles.drinkAlcohol, selectedDrink === drink.id && { color: '#FFFFFF' }] }>
                    {drink.isCustom ? 'Aangepast' : `${drink.abv}% alcohol`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Drink Input */}
        {selectedDrink === 'other' && (
          <View style={styles.section}>
            <CustomDrinkInput onAlcoholChange={handleCustomAlcoholChange} />
          </View>
        )}

        {/* Quantity Selection */}
        {selectedDrink && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hoeveel glazen?</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.quantityInfo}>
              {quantity} glas{quantity > 1 ? 'sen' : ''} = {
                selectedDrink === 'other' 
                  ? ((customAlcohol.volume * customAlcohol.percentage * 0.789) / 100 * quantity).toFixed(1)
                  : drinkTypes[selectedDrink].unitsPerGlass * quantity
              } standaard glazen
            </Text>
          </View>
        )}

        {/* Log Button */}
        {selectedDrink && (
          <TouchableOpacity style={styles.logButton} onPress={handleLogDrink}>
            <Text style={styles.logButtonText}>Drankje loggen</Text>
          </TouchableOpacity>
        )}

        {/* Session Details */}
        {currentSession && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actieve drinksessie</Text>
            <CountdownCard 
              session={currentSession} 
              drinkTypes={drinkTypes} 
              profile={profile} 
            />
            {currentSession.entries.length > 0 && (
              <DrinkLogTable 
                entries={currentSession.entries} 
                drinkTypes={drinkTypes} 
                profile={profile}
                onDelete={(entryId) => dispatchDrinkAction({ type: 'DELETE_ENTRY', payload: { id: entryId } })}
              />
            )}
            <View style={styles.sessionActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleUndoLast}>
                <Text style={styles.secondaryButtonText}>Undo laatste</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleEndSession}>
                <Text style={styles.secondaryButtonText}>Sessie beëindigen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Wist je dat?</Text>
          <Text style={styles.infoText}>
            Richtlijn ~ 2–2,5 u/standaarddrank; licht gewicht → dichter bij 2,5–3 u.
            We berekenen wanneer je weer veilig kunt voeden op basis van je gewicht en de LactMed-nomogram.
          </Text>
        </View>
      </ScrollView>

      {/* Success splash - vergelijkbaar met planning screen */}
      {showSuccess && (
        <Animated.View style={[styles.successSplash, { opacity: successAnim }]}>
          {/* Milky white background with pink spheres */}
          <AnimatedBackground variant="variant2" />

          {/* Darker pink confetti pieces - van hoger, langzamer */}
          {Array.from({ length: 60 }).map((_, i) => {
            const colors = ['#F49B9B', '#E8797A', '#D95F61', '#FA9795', '#FFB4A8'];
            const color = colors[i % colors.length];
            const size = Math.random() * 14 + 6;
            const left = Math.random() * 100;
            const fallDistance = 1000 + Math.random() * 500;
            const rotation = Math.random() * 720 - 360;
            const startDelay = Math.random() * 300;

            return (
              <Animated.View
                key={i}
                style={[
                  styles.confettiPiece,
                  {
                    backgroundColor: color,
                    width: size,
                    height: size,
                    left: `${left}%`,
                    transform: [
                      {
                        translateY: confettiFall.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-300 - startDelay, fallDistance],
                        }),
                      },
                      {
                        rotate: confettiFall.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${rotation}deg`],
                        }),
                      },
                    ],
                  },
                ]}
              />
            );
          })}

          {/* Success messages */}
          <View style={styles.successTextContainer}>
            {/* Roze celebration tekst - boven Mimi */}
            <View style={styles.celebrationTextContainer}>
              <Text style={styles.celebrationText}>Je countdown is bijgewerkt</Text>
              <Text style={styles.celebrationText}>Goed bezig!</Text>
            </View>

            {/* Animated Mimi with bounce effect */}
            <Animated.View
              style={[
                styles.successMimiContainer,
                {
                  transform: [
                    {
                      scale: mimiScale.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={require('../../assets/Mimi_karakters/2_mimi_happy_1.png')} style={styles.successMimi} />
            </Animated.View>

            {/* Zwarte title en subtekst - onder Mimi */}
            <Text style={styles.successTitle}>Drankje gelogd!</Text>
            <Text style={styles.successSubtitle}>Bekijk je countdown op home</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#F49B9B',
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    color: '#4B3B36',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 24,
    color: '#8E8B88',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    color: '#4B3B36',
    marginBottom: 16,
  },
  drinkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  drinkCard: {
    width: (width - 72) / 2, // 2 columns with padding
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  drinkCardSelected: {
    borderColor: '#F49B9B',
    backgroundColor: '#FDF2F2',
  },
  drinkIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  drinkName: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3B36',
    marginBottom: 4,
    textAlign: 'center',
  },
  drinkAlcohol: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#8E8B88',
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F49B9B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    color: '#FFFFFF',
  },
  quantityText: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 24,
    color: '#4B3B36',
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  quantityInfo: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#8E8B88',
    textAlign: 'center',
  },
  logButton: {
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 24,
    marginBottom: 32,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#F0EAE3',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 40,
  },
  infoTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3B36',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: '#F4D3D1',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 8,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#6A5856',
    textAlign: 'center',
  },
  // Success splash styles
  successSplash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F3',
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 3,
    opacity: 0.9,
  },
  successTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  celebrationTextContainer: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  celebrationText: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 19,
    lineHeight: 26,
    color: '#E8797A',
    textAlign: 'center',
    textShadowColor: 'rgba(232, 121, 122, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  successMimiContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMimi: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  successTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 26,
    color: '#4B3B36',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 15,
    color: '#7A6C66',
    textAlign: 'center',
  },
});
