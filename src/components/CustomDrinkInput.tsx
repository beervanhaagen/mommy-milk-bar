// components/CustomDrinkInput.tsx - Custom alcohol input with sliders
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface CustomDrinkInputProps {
  onAlcoholChange: (alcoholPercentage: number, volumeMl: number) => void;
}

export const CustomDrinkInput: React.FC<CustomDrinkInputProps> = ({ onAlcoholChange }) => {
  const [alcoholPercentage, setAlcoholPercentage] = useState(12);
  const [volumeMl, setVolumeMl] = useState(150);

  const handleAlcoholChange = (value: number) => {
    setAlcoholPercentage(value);
    onAlcoholChange(value, volumeMl);
  };

  const handleVolumeChange = (value: number) => {
    setVolumeMl(value);
    onAlcoholChange(alcoholPercentage, value);
  };

  // Calculate standard drinks
  const calculateStandardDrinks = (abv: number, volume: number) => {
    // Standard drink = 10g alcohol
    // Volume in ml, ABV in %
    const alcoholGrams = (volume * abv * 0.789) / 100; // 0.789 is density of alcohol
    return alcoholGrams / 10; // 10g per standard drink
  };

  const standardDrinks = calculateStandardDrinks(alcoholPercentage, volumeMl);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom drankje</Text>
      
      {/* Alcohol Percentage Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Alcohol percentage: {alcoholPercentage}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={50}
          step={0.5}
          value={alcoholPercentage}
          onValueChange={handleAlcoholChange}
          minimumTrackTintColor="#E88F8A"
          maximumTrackTintColor="#F4D3D1"
          thumbTintColor="#E88F8A"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>0%</Text>
          <Text style={styles.sliderLabel}>50%</Text>
        </View>
      </View>

      {/* Volume Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Volume: {volumeMl}ml</Text>
        <Slider
          style={styles.slider}
          minimumValue={50}
          maximumValue={500}
          step={10}
          value={volumeMl}
          onValueChange={handleVolumeChange}
          minimumTrackTintColor="#E88F8A"
          maximumTrackTintColor="#F4D3D1"
          thumbTintColor="#E88F8A"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>50ml</Text>
          <Text style={styles.sliderLabel}>500ml</Text>
        </View>
      </View>

      {/* Calculation Display */}
      <View style={styles.calculationContainer}>
        <Text style={styles.calculationText}>
          {standardDrinks.toFixed(1)} standaard glazen
        </Text>
        <Text style={styles.calculationSubtext}>
          {alcoholPercentage}% × {volumeMl}ml = {((volumeMl * alcoholPercentage * 0.789) / 100).toFixed(1)}g alcohol
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#E88F8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 18,
    color: '#3D2F2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#6A5856',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    backgroundColor: '#E88F8A',
    width: 20,
    height: 20,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#8A7A78',
  },
  calculationContainer: {
    backgroundColor: '#F4D3D1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  calculationText: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 16,
    color: '#3D2F2E',
    marginBottom: 4,
  },
  calculationSubtext: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#6A5856',
    textAlign: 'center',
  },
});
