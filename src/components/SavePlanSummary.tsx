import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrinkPlan } from '../types/planning';
import { formatTime, formatDateTime } from '../lib/planning';

interface SavePlanSummaryProps {
  plan: DrinkPlan;
  safeFeedAt: Date;
  onPress?: () => void;
}

export const SavePlanSummary: React.FC<SavePlanSummaryProps> = ({ 
  plan, 
  safeFeedAt, 
  onPress 
}) => {
  const getDrinkTypeLabel = (type: string) => {
    switch (type) {
      case 'WINE': return 'wijn';
      case 'BEER': return 'bier';
      case 'COCKTAIL': return 'cocktail';
      case 'OTHER': return 'overig';
      default: return 'drankje';
    }
  };

  const getPaceLabel = (pace: string) => {
    switch (pace) {
      case 'ONE_HOUR': return 'in 1 uur';
      case 'TWO_HOURS': return 'over 2 uur';
      case 'THREE_HOURS': return 'over 3 uur';
      default: return '';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.icon}>🗓</Text>
        <View style={styles.content}>
          <Text style={styles.title}>
            {formatDateTime(plan.startAt)} — {plan.drinks} glas{plan.drinks > 1 ? 'en' : ''} {getDrinkTypeLabel(plan.drinkType)}
          </Text>
          <Text style={styles.subtitle}>
            Veilig voeden rond <Text style={styles.highlight}>{formatTime(safeFeedAt)}</Text>
          </Text>
          {plan.goal === 'MIN_FREEZER' && (
            <Text style={styles.hint}>
              (Pomp 80ml of voed voor start)
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: '#4B3C33',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    color: '#7A6C66',
    marginBottom: 2,
  },
  highlight: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#4B3C33',
  },
  hint: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#7A6C66',
    fontStyle: 'italic',
  },
});
