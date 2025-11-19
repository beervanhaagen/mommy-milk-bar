import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeIcon, WarningIcon, ClockIcon } from './icons/PlanningIcons';

interface VeiligeTijdenCalculatorProps {
  drinks: PlannedDrink[];
  onSafeTimeChange: (safeTime: Date) => void;
}

interface PlannedDrink {
  id: string;
  type: string;
  time: Date | string;
  amount: number;
}

const VeiligeTijdenCalculator: React.FC<VeiligeTijdenCalculatorProps> = ({
  drinks,
  onSafeTimeChange
}) => {
  const [bufferTime, setBufferTime] = useState(30); // minutes
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'low'>('high');

  const calculateSafeFeedTime = useCallback(() => {
    if (!drinks || drinks.length === 0) return new Date();

    // Normalize times to Date objects and filter out invalid ones
    const normalized = drinks
      .map(d => {
        const t = d.time instanceof Date ? d.time : new Date(d.time as string);
        return isNaN(t.getTime()) ? null : { ...d, time: t } as { id: string; type: string; time: Date; amount: number };
      })
      .filter(Boolean) as Array<{ id: string; type: string; time: Date; amount: number }>;

    if (normalized.length === 0) return new Date();

    // Find the last drink by timestamp
    const lastDrink = normalized.reduce((latest, drink) =>
      drink.time.getTime() > latest.time.getTime() ? drink : latest
    );

    // Calculate alcohol clearance time (2 hours per standard drink)
    const standardDrinks = normalized.reduce((total, drink) => {
      const drinkMultiplier = drink.type === 'WINE' ? 1.2 :
        drink.type === 'BEER' ? 0.8 :
          drink.type === 'COCKTAIL' ? 1.5 : 1.0;
      return total + (drink.amount * drinkMultiplier);
    }, 0);

    const clearanceHours = standardDrinks * 2;
    const clearanceTime = new Date(lastDrink.time.getTime() + clearanceHours * 60 * 60 * 1000);

    // Add buffer time
    const safeTime = new Date(clearanceTime.getTime() + bufferTime * 60 * 1000);

    return safeTime;
  }, [drinks, bufferTime]);

  const safeFeedTime = useMemo(() => calculateSafeFeedTime(), [calculateSafeFeedTime]);
  const extraSafeTime = useMemo(() => new Date(safeFeedTime.getTime() + 30 * 60 * 1000), [safeFeedTime]);
  const absoluteSafeTime = useMemo(() => new Date(safeFeedTime.getTime() + 60 * 60 * 1000), [safeFeedTime]);

  useEffect(() => {
    onSafeTimeChange(safeFeedTime);
  }, [safeFeedTime, onSafeTimeChange]);

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'low': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const getConfidenceText = (level: string) => {
    switch (level) {
      case 'high': return '95%';
      case 'medium': return '85%';
      case 'low': return '70%';
      default: return '95%';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeDifference = (time: Date) => {
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}u ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Veilige voeding tijden</Text>
      <Text style={styles.subtitle}>Indicatie, geen medisch advies.</Text>
      
      {drinks.length > 0 ? (
        <View style={styles.content}>
          <View style={[styles.timeDisplay, { marginTop: 12 }]}>
            <View style={[styles.timeItem, { alignItems: 'center', marginTop: 8 }] }>
              <Text style={styles.timeLabel}>Veilig voeden vanaf:</Text>
              <Text style={styles.timeValue}>
                {safeFeedTime.toLocaleTimeString('nl-NL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              <Image source={require('../../assets/Mimi_karakters/Milkbar_open_1.png')} style={styles.mimiHero} />
            </View>
          </View>

          <View style={styles.bufferSection}>
            <Text style={styles.bufferLabel}>Extra marge:</Text>
            <View style={styles.bufferButtons}>
              <TouchableOpacity 
                style={[styles.bufferButton, bufferTime === 15 && styles.bufferButtonActive]}
                onPress={() => setBufferTime(15)}
              >
                <Text style={[styles.bufferButtonText, bufferTime === 15 && styles.bufferButtonTextActive]}>
                  +15 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bufferButton, bufferTime === 30 && styles.bufferButtonActive]}
                onPress={() => setBufferTime(30)}
              >
                <Text style={[styles.bufferButtonText, bufferTime === 30 && styles.bufferButtonTextActive]}>
                  +30 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bufferButton, bufferTime === 45 && styles.bufferButtonActive]}
                onPress={() => setBufferTime(45)}
              >
                <Text style={[styles.bufferButtonText, bufferTime === 45 && styles.bufferButtonTextActive]}>
                  +45 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bufferButton, bufferTime === 60 && styles.bufferButtonActive]}
                onPress={() => setBufferTime(60)}
              >
                <Text style={[styles.bufferButtonText, bufferTime === 60 && styles.bufferButtonTextActive]}>
                  +60 min
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Voeg drankjes toe om veilige voeding tijden te berekenen
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#7A6C66',
    fontFamily: 'Poppins',
    marginTop: 0,
    marginBottom: 12,
    textAlign: 'left',
  },
  content: {
    gap: 16,
  },
  timeDisplay: {
    gap: 12,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#8E8B88',
    fontFamily: 'Poppins',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3B36',
    fontFamily: 'Poppins',
  },
  bufferSection: {
    gap: 8,
  },
  bufferLabel: {
    fontSize: 14,
    color: '#8E8B88',
    fontFamily: 'Poppins',
  },
  bufferButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bufferButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F0FF',
    backgroundColor: '#F8F9FA',
  },
  bufferButtonActive: {
    backgroundColor: '#F49B9B',
    borderColor: '#F49B9B',
  },
  bufferButtonText: {
    fontSize: 12,
    color: '#8E8B88',
    fontFamily: 'Poppins',
  },
  bufferButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8B88',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Poppins',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#7A6C66',
    fontFamily: 'Poppins',
  },
  mimiSmall: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  mimiHero: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B3B36',
    marginLeft: 0,
    fontFamily: 'Poppins',
    textAlign: 'left',
  },
  timeSection: {
    marginBottom: 20,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeDifference: {
    fontSize: 14,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
  },
  confidenceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F414E',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  bufferOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  bufferButtonSelected: {
    backgroundColor: '#F49B9B',
    borderColor: '#F49B9B',
  },
  bufferButtonTextSelected: {
    color: '#FFFFFF',
  },
  tipsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F9',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F414E',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  tipText: {
    fontSize: 14,
    color: '#A1A4B2',
    marginBottom: 4,
    fontFamily: 'Poppins',
  },
});

export default VeiligeTijdenCalculator;
