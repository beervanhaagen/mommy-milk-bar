import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/state/store';
import { drinkTypes } from '../../src/data/drinkTypes';
import { DrinkLogTable } from '../../src/components/DrinkLogTable';
import { CountdownCard } from '../../src/components/CountdownCard';
import { CustomDrinkInput } from '../../src/components/CustomDrinkInput';

const { width, height } = Dimensions.get('window');

// Use imported drink types

export default function Drinks() {
  const router = useRouter();
  const { getCurrentSession, getProfile, dispatchDrinkAction } = useStore();
  const [selectedDrink, setSelectedDrink] = useState('wine');
  const [quantity, setQuantity] = useState(1);
  const [customAlcohol, setCustomAlcohol] = useState({ percentage: 12, volume: 150 });

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

    // Direct navigate to home - no success screen
    Vibration.vibrate(100);
    router.push('/(tabs)');
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
                  <Text
                    style={[
                      styles.drinkName,
                      selectedDrink === drink.id && styles.drinkNameSelected,
                    ]}
                  >
                    {drink.label}
                  </Text>
                  <Text
                    style={[
                      styles.drinkAlcohol,
                      selectedDrink === drink.id && styles.drinkAlcoholSelected,
                    ]}
                  >
                    {drink.isCustom ? 'Aangepast' : `${drink.abv}% alcohol`}
                  </Text>
                  {!drink.isCustom && (
                    <Text
                      style={[
                        styles.drinkVolume,
                        selectedDrink === drink.id && styles.drinkVolumeSelected,
                      ]}
                    >
                      ~{drink.standardVolumeMl}ml per glas
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Volume Warning */}
          {selectedDrink && !drinkTypes[selectedDrink]?.isCustom && (
            <View style={styles.volumeWarning}>
              <Text style={styles.volumeWarningText}>
                <Text style={styles.volumeWarningBold}>Let op: </Text>
                {drinkTypes[selectedDrink]?.volumeInfo}.
                Drink je meer of minder? Kies dan "Overig" en vul het exacte volume in voor een veilige berekening.
              </Text>
            </View>
          )}
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

        {/* Alcohol Warning - Show if > 3 drinks already logged */}
        {currentSession && currentSession.entries && currentSession.entries.length >= 3 && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Let op: </Text>
              Regelmatig veel alcohol kan melkproductie en baby-ontwikkeling beïnvloeden.
              Overweeg om te stoppen of minder te drinken. Raadpleeg bij twijfel een zorgverlener.
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

      </ScrollView>
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
    backgroundColor: '#F49B9B',
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
  drinkNameSelected: {
    color: '#FFFFFF',
  },
  drinkAlcohol: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#8E8B88',
    textAlign: 'center',
  },
  drinkAlcoholSelected: {
    color: '#FFFFFF',
  },
  drinkVolume: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 11,
    color: '#F49B9B',
    textAlign: 'center',
    marginTop: 4,
  },
  drinkVolumeSelected: {
    color: '#FFFFFF',
  },
  volumeWarning: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F49B9B',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  volumeWarningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  volumeWarningText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    color: '#7A6C66',
    flex: 1,
  },
  volumeWarningBold: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#4B3B36',
  },
  tipContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F49B9B',
  },
  tipText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    color: '#7A6C66',
  },
  tipBold: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#4B3B36',
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
  // warningContainer / warningText replaced by tipContainer styles
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
});
