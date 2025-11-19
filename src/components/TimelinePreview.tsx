import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrinkPlan, Feasibility } from '../types/planning';
import { 
  drinkWindowEnd, 
  safeFeedAt, 
  getFeasibilityColor, 
  getFeasibilityText,
  formatTime 
} from '../lib/planning';

interface TimelinePreviewProps {
  plan: Partial<DrinkPlan>;
  feasibility?: Feasibility;
  nextFeeds?: Date[];
}

export const TimelinePreview: React.FC<TimelinePreviewProps> = ({ 
  plan, 
  feasibility = 'GREEN',
  nextFeeds = []
}) => {
  if (!plan.startAt || !plan.drinks || !plan.pace) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Vul je planning in om het resultaat te zien</Text>
      </View>
    );
  }

  const fullPlan: DrinkPlan = {
    startAt: plan.startAt,
    drinks: plan.drinks,
    pace: plan.pace,
    drinkType: plan.drinkType || 'WINE',
    goal: plan.goal || 'MIN_FREEZER',
    canPreFeed: plan.canPreFeed || true,
    canMicroPump: plan.canMicroPump || true,
    microPumpTargetMl: plan.microPumpTargetMl,
    safetyBufferMin: plan.safetyBufferMin || 30
  };

  const windowEnd = drinkWindowEnd(fullPlan);
  const safeFeedTime = safeFeedAt(fullPlan);
  const feasibilityColor = getFeasibilityColor(feasibility);
  const feasibilityText = getFeasibilityText(feasibility);

  const getTipsForFeasibility = (feasibility: Feasibility): string[] => {
    switch (feasibility) {
      case 'GREEN':
        return ['🎉 Past perfect tussen je voedingen!'];
      case 'YELLOW':
        return [
          '💡 Voed 30 min vóór start om zonder voorraad te kunnen.',
          '⏰ Met +1 drankje schuift veilig voeden naar 00:15.'
        ];
      case 'RED':
        return [
          '⚠️ Overweeg om minder te drinken of de timing aan te passen.',
          '🤱 Voed vóór start en verschuif eerste slok.'
        ];
      default:
        return [];
    }
  };

  return (
    <View style={styles.timelinePreview}>
      <Text style={styles.sectionTitle}>Jouw planning</Text>
      <Text style={styles.sectionSubtext}>Zo past je drankje in je voedingsschema.</Text>
      
      {/* Grote badge */}
      <View style={[styles.safeFeedBadge, { backgroundColor: feasibilityColor }]}>
        <Text style={styles.safeFeedTitle}>Je kunt veilig voeden vanaf</Text>
        <Text style={styles.safeFeedTime}>
          {safeFeedTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.safeFeedDetails}>
          (op basis van {plan.drinks} glazen {plan.drinkType?.toLowerCase()}, gespreid over {plan.pace?.toLowerCase()})
        </Text>
      </View>

      {/* Mini tijdlijn */}
      <View style={styles.miniTimeline}>
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.timelineLabel}>Nu</Text>
          <Text style={styles.timelineTime}>{new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        
        <View style={styles.timelineLine} />
        
        <View style={styles.timelineItem}>
          <Text style={styles.timelineIcon}>🍷</Text>
          <Text style={styles.timelineLabel}>Drink</Text>
          <Text style={styles.timelineTime}>{formatTime(plan.startAt!)}</Text>
        </View>
        
        <View style={styles.timelineLine} />
        
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, { backgroundColor: feasibilityColor }]} />
          <Text style={styles.timelineLabel}>Veilig voeden</Text>
          <Text style={styles.timelineTime}>{formatTime(safeFeedTime)}</Text>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        {getTipsForFeasibility(feasibility).map((tip, index) => (
          <Text key={index} style={styles.tipText}>• {tip}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelinePreview: {
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
  container: {
    gap: 16,
  },
  placeholder: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#7C6D63',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  safeFeedBadge: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  safeFeedTitle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  safeFeedTime: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  safeFeedDetails: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  miniTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineIcon: {
    fontSize: 16,
    marginBottom: 6,
  },
  timelineLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    color: '#4B3C33',
    textAlign: 'center',
    marginBottom: 2,
  },
  timelineTime: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: '#7C6D63',
    textAlign: 'center',
  },
  timelineLine: {
    height: 2,
    flex: 1,
    backgroundColor: '#E8F0FF',
    marginHorizontal: 8,
  },
  tipsSection: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  tipText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    color: '#7C6D63',
    lineHeight: 18,
    marginBottom: 4,
  },
});