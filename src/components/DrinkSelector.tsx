import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import { WineGlassIcon, BeerMugIcon, SpiritsIcon, CocktailIcon } from './icons/DrinkIcons';

interface DrinkSelectorProps {
  drinks: number;
  onDrinksChange: (drinks: number) => void;
  drinkType: string;
  onDrinkTypeChange: (type: string) => void;
  pace: string;
  onPaceChange: (pace: string) => void;
}

export const DrinkSelector: React.FC<DrinkSelectorProps> = ({
  drinks,
  onDrinksChange,
  drinkType,
  onDrinkTypeChange,
  pace,
  onPaceChange,
}) => {
  const [glassFill] = useState(new Animated.Value(0.2));

  useEffect(() => {
    const targetFill = Math.min(0.2 + (drinks || 1) * 0.2, 1.0);
    Animated.spring(glassFill, {
      toValue: targetFill,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [drinks, glassFill]);

  const drinkTypes = [
    { id: 'WINE', label: 'Wijn', icon: WineGlassIcon },
    { id: 'BEER', label: 'Bier', icon: BeerMugIcon },
    { id: 'COCKTAIL', label: 'Cocktail', icon: CocktailIcon },
    { id: 'OTHER', label: 'Overig', icon: SpiritsIcon }
  ];

  const paceOptions = [
    { 
      id: 'ONE_HOUR', 
      label: 'Alles binnen 1 uur',
      segments: 1,
      description: 'Intensief maar snel'
    },
    { 
      id: 'TWO_HOURS', 
      label: 'Gespreid over 2 uur',
      segments: 2,
      description: 'Gezellig tempo'
    },
    { 
      id: 'THREE_HOURS', 
      label: 'Gespreid over 3 uur',
      segments: 3,
      description: 'Rustig genieten'
    }
  ];

  return (
    <View style={styles.drinkSelector}>
      <Text style={styles.sectionTitle}>Drankjes & tempo</Text>
      <Text style={styles.sectionSubtext}>Hoeveel denk je te nemen en in welk tempo?</Text>
      
      {/* Glass Section */}
      <View style={styles.glassSection}>
        <Text style={styles.subsectionLabel}>Aantal drankjes</Text>
        <View style={styles.glassContainer}>
          <View style={styles.glass}>
            <Animated.View
              style={[
                styles.glassFill,
                {
                  height: glassFill.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['20%', '80%'],
                  })
                }
              ]}
            />
            <Text style={styles.glassCount}>{drinks}</Text>
          </View>
          <View style={styles.glassControls}>
            <TouchableOpacity
              style={[styles.glassButton, drinks <= 1 && styles.glassButtonDisabled]}
              onPress={() => {
                Vibration.vibrate(50);
                onDrinksChange(Math.max(1, drinks - 1));
              }}
            >
              <Text style={styles.glassButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.glassButton}
              onPress={() => {
                Vibration.vibrate(50);
                onDrinksChange(drinks + 1);
              }}
            >
              <Text style={styles.glassButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Drink Type */}
      <View style={styles.typeSection}>
        <Text style={styles.subsectionLabel}>Type drankje</Text>
        <View style={styles.typeGrid}>
          {drinkTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeOption,
                drinkType === type.id && styles.typeOptionActive
              ]}
              onPress={() => {
                Vibration.vibrate(30);
                onDrinkTypeChange(type.id);
              }}
            >
              <type.icon size={24} />
              <Text style={[
                styles.typeLabel,
                drinkType === type.id && styles.typeLabelActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Volume info for selected drink */}
        <View style={styles.volumeInfo}>
          <Text style={styles.volumeInfoIcon}>ℹ️</Text>
          <Text style={styles.volumeInfoText}>
            We gaan uit van standaard glazen ({
              drinkType === 'WINE' ? '~105ml wijn' :
              drinkType === 'BEER' ? '~250ml bier (geen vaas!)' :
              drinkType === 'COCKTAIL' ? '~125ml cocktail' : '~35ml sterke drank'
            }). Drink je grotere glazen? Bereken dan met meer drankjes voor een veilige schatting.
          </Text>
        </View>
      </View>

      {/* Pace with Timeline Visualization */}
      <View style={styles.paceSection}>
        <Text style={styles.subsectionLabel}>Drinktempo</Text>
        <View style={styles.paceContainer}>
          {paceOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.paceOption,
                pace === option.id && styles.paceOptionActive
              ]}
              onPress={() => {
                Vibration.vibrate(30);
                onPaceChange(option.id);
              }}
            >
              <View style={styles.paceHeader}>
                <Text style={[
                  styles.paceText,
                  pace === option.id && styles.paceTextActive
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.paceDescription,
                  pace === option.id && styles.paceDescriptionActive
                ]}>
                  {option.description}
                </Text>
              </View>
              <View style={styles.timelineVisualization}>
                {Array.from({ length: option.segments }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.timelineSegment,
                      pace === option.id && styles.timelineSegmentActive
                    ]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drinkSelector: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3C33',
    marginBottom: 8,
  },
  sectionSubtext: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#7C6D63',
    marginBottom: 20,
  },
  subsectionLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#4B3C33',
    marginBottom: 12,
  },
  glassSection: {
    marginBottom: 20,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8F0FF',
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  glass: {
    width: 60,
    height: 90,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#9BB9F4',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 20,
  },
  glassFill: {
    width: '100%',
    backgroundColor: '#9BB9F4',
    position: 'absolute',
    bottom: 0,
  },
  glassCount: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 18,
    color: '#4B3C33',
    zIndex: 1,
  },
  glassControls: {
    gap: 8,
  },
  glassButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9BB9F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassButtonDisabled: {
    backgroundColor: '#D9D9D9',
  },
  glassButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#FFFFFF',
  },
  typeSection: {
    marginBottom: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  volumeInfo: {
    backgroundColor: '#E8F0FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#9BB9F4',
  },
  volumeInfoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  volumeInfoText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#4B3C33',
    flex: 1,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  typeOptionActive: {
    backgroundColor: '#9BB9F4',
    borderColor: '#7A9DE8',
  },
  typeLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    color: '#4B3C33',
    marginTop: 8,
  },
  typeLabelActive: {
    color: '#FFFFFF',
  },
  paceSection: {
    marginBottom: 16,
  },
  paceContainer: {
    gap: 12,
  },
  paceOption: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  paceOptionActive: {
    backgroundColor: '#9BB9F4',
    borderColor: '#7A9DE8',
  },
  paceHeader: {
    marginBottom: 8,
  },
  paceText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 15,
    color: '#4B3C33',
    marginBottom: 2,
  },
  paceTextActive: {
    color: '#FFFFFF',
  },
  paceDescription: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#7C6D63',
  },
  paceDescriptionActive: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  timelineVisualization: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  timelineSegment: {
    height: 6,
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  timelineSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
});