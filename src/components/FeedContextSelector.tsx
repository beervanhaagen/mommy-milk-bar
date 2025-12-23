import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import Slider from '@react-native-community/slider';

interface FeedContextSelectorProps {
  feedStrategy: 'DIRECT' | 'PUMP';
  freezerStockMl: number;
  onFeedStrategyChange: (strategy: 'DIRECT' | 'PUMP') => void;
  onFreezerStockChange: (ml: number) => void;
}

export const FeedContextSelector: React.FC<FeedContextSelectorProps> = ({
  feedStrategy,
  freezerStockMl,
  onFeedStrategyChange,
  onFreezerStockChange
}) => {
  return (
    <View style={styles.feedContextSelector}>
      <Text style={styles.sectionTitle}>Voeding & voorbereiding</Text>
      <Text style={styles.sectionSubtext}>Hoe wil je het aanpakken met voeden rond je drankje?</Text>
      
      {/* Strategy toggle */}
      <View style={styles.strategySection}>
        <TouchableOpacity
          style={[
            styles.strategyOption,
            feedStrategy === 'DIRECT' && styles.strategyOptionActive
          ]}
          onPress={() => {
            Vibration.vibrate(30);
            onFeedStrategyChange('DIRECT');
          }}
        >
          <Text style={styles.strategyIcon}>🤱</Text>
          <Text style={[
            styles.strategyText,
            feedStrategy === 'DIRECT' && styles.strategyTextActive
          ]}>
            Ik geef direct borstvoeding
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.strategyOption,
            feedStrategy === 'PUMP' && styles.strategyOptionActive
          ]}
          onPress={() => {
            Vibration.vibrate(30);
            onFeedStrategyChange('PUMP');
          }}
        >
          <Text style={styles.strategyIcon}>🍼</Text>
          <Text style={[
            styles.strategyText,
            feedStrategy === 'PUMP' && styles.strategyTextActive
          ]}>
            Ik maak voorraad klaar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Freezer stock input */}
      {feedStrategy === 'PUMP' && (
        <View style={styles.freezerSection}>
          <Text style={styles.inputLabel}>Hoeveel ml wil je klaarzetten?</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={200}
              value={freezerStockMl}
              onValueChange={(value) => {
                Vibration.vibrate(10);
                onFreezerStockChange(value);
              }}
              minimumTrackTintColor="#9BB9F4"
              maximumTrackTintColor="#E8F0FF"
              thumbTintColor="#9BB9F4"
            />
            <Text style={styles.sliderValue}>{Math.round(freezerStockMl)} ml</Text>
          </View>
          <Text style={styles.sliderHint}>± 1 voeding</Text>
        </View>
      )}

      {/* Mimi tip */}
      <View style={styles.mimiTip}>
        <Text style={styles.tipText}>
          Tip: Voed vlak vóór je eerste drankje, dat scheelt vaak uren!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  feedContextSelector: {
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
  strategySection: {
    marginBottom: 20,
  },
  strategyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F49B9B',
  },
  strategyOptionActive: {
    backgroundColor: '#F49B9B',
    borderColor: '#F49B9B',
  },
  strategyIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  strategyText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#4B3C33',
    flex: 1,
  },
  strategyTextActive: {
    color: '#FFFFFF',
  },
  freezerSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#4B3C33',
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#9BB9F4',
    width: 20,
    height: 20,
  },
  sliderValue: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3C33',
    marginLeft: 16,
    minWidth: 50,
    textAlign: 'right',
  },
  sliderHint: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#7C6D63',
    textAlign: 'center',
    marginTop: 8,
  },
  mimiTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F49B9B',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  tipTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#4B3C33',
  },
  tipText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    color: '#7C6D63',
    flex: 1,
  },
});