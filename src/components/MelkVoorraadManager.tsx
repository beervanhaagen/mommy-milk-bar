import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MilkIcon, WarningIcon, SafeIcon } from './icons/PlanningIcons';

interface MelkVoorraadManagerProps {
  predictedFeeds: FeedPrediction[];
  onMilkNeedChange: (milkNeed: number) => void;
}

interface FeedPrediction {
  time: Date;
  amount: number;
  confidence: number;
  type: 'predicted' | 'manual';
}

const MelkVoorraadManager: React.FC<MelkVoorraadManagerProps> = ({ 
  predictedFeeds, 
  onMilkNeedChange 
}) => {
  const [vriesmelkVoorraad, setVriesmelkVoorraad] = useState(300);
  const [kunstvoedingVoorraad, setKunstvoedingVoorraad] = useState(200);
  const [useVriesmelk, setUseVriesmelk] = useState(true);
  const [useKunstvoeding, setUseKunstvoeding] = useState(false);

  // Calculate milk need during drinking period
  const calculateMilkNeed = () => {
    const now = new Date();
    const drinkingEndTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now
    
    const feedsDuringDrinking = predictedFeeds.filter(feed => 
      feed.time >= now && feed.time <= drinkingEndTime
    );
    
    return feedsDuringDrinking.reduce((total, feed) => total + feed.amount, 0);
  };

  const milkNeed = calculateMilkNeed();
  const vriesmelkNeeded = useVriesmelk ? milkNeed : 0;
  const kunstvoedingNeeded = useKunstvoeding ? milkNeed : 0;
  
  const vriesmelkRemaining = vriesmelkVoorraad - vriesmelkNeeded;
  const kunstvoedingRemaining = kunstvoedingVoorraad - kunstvoedingNeeded;
  
  const isVoldoende = vriesmelkRemaining >= 0 && kunstvoedingRemaining >= 0;

  const handleMilkNeedChange = useCallback(() => {
    onMilkNeedChange(milkNeed);
  }, [milkNeed, onMilkNeedChange]);

  useEffect(() => {
    handleMilkNeedChange();
  }, [handleMilkNeedChange]);

  const getStatusColor = (remaining: number) => {
    if (remaining >= 120) return '#4CAF50';
    if (remaining >= 0) return '#FF9800';
    return '#F44336';
  };

  const getStatusText = (remaining: number) => {
    if (remaining >= 120) return 'Voldoende';
    if (remaining >= 0) return 'Nipt';
    return 'Tekort';
  };

  const getStatusIcon = (remaining: number) => {
    if (remaining >= 0) return <SafeIcon size={16} color={getStatusColor(remaining)} />;
    return <WarningIcon size={16} color={getStatusColor(remaining)} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MilkIcon size={20} color="#F49B9B" />
        <Text style={styles.title}>Melk planning</Text>
      </View>

      <View style={styles.planningSection}>
        <Text style={styles.sectionTitle}>Tijdens drinken</Text>
        <View style={styles.feedList}>
          {predictedFeeds.map((feed, index) => {
            const isDuringDrinking = feed.time >= new Date() && 
              feed.time <= new Date(Date.now() + 4 * 60 * 60 * 1000);
            
            if (!isDuringDrinking) return null;
            
            return (
              <View key={index} style={styles.feedItem}>
                <Text style={styles.feedTime}>
                  {feed.time.toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
                <Text style={styles.feedAmount}>{feed.amount}ml</Text>
                <View style={styles.feedSource}>
                  {useVriesmelk && (
                    <Text style={styles.sourceText}>Vriesmelk</Text>
                  )}
                  {useKunstvoeding && (
                    <Text style={styles.sourceText}>Kunstvoeding</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.voorraadSection}>
        <Text style={styles.sectionTitle}>Voorraad status</Text>
        
        <View style={styles.voorraadItem}>
          <View style={styles.voorraadHeader}>
            <Text style={styles.voorraadLabel}>Vriesmelk</Text>
            <View style={styles.voorraadStatus}>
              {getStatusIcon(vriesmelkRemaining)}
              <Text style={[
                styles.statusText,
                { color: getStatusColor(vriesmelkRemaining) }
              ]}>
                {getStatusText(vriesmelkRemaining)}
              </Text>
            </View>
          </View>
          <View style={styles.voorraadDetails}>
            <Text style={styles.voorraadText}>
              {vriesmelkVoorraad}ml beschikbaar
            </Text>
            <Text style={styles.needText}>
              {vriesmelkNeeded}ml nodig
            </Text>
            <Text style={[
              styles.remainingText,
              { color: getStatusColor(vriesmelkRemaining) }
            ]}>
              {vriesmelkRemaining >= 0 ? '+' : ''}{vriesmelkRemaining}ml over
            </Text>
          </View>
        </View>

        <View style={styles.voorraadItem}>
          <View style={styles.voorraadHeader}>
            <Text style={styles.voorraadLabel}>Kunstvoeding</Text>
            <View style={styles.voorraadStatus}>
              {getStatusIcon(kunstvoedingRemaining)}
              <Text style={[
                styles.statusText,
                { color: getStatusColor(kunstvoedingRemaining) }
              ]}>
                {getStatusText(kunstvoedingRemaining)}
              </Text>
            </View>
          </View>
          <View style={styles.voorraadDetails}>
            <Text style={styles.voorraadText}>
              {kunstvoedingVoorraad}ml beschikbaar
            </Text>
            <Text style={styles.needText}>
              {kunstvoedingNeeded}ml nodig
            </Text>
            <Text style={[
              styles.remainingText,
              { color: getStatusColor(kunstvoedingRemaining) }
            ]}>
              {kunstvoedingRemaining >= 0 ? '+' : ''}{kunstvoedingRemaining}ml over
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Tips</Text>
        {!isVoldoende && (
          <Text style={styles.tipText}>
            • Pomp 30ml extra voor buffer
          </Text>
        )}
        {vriesmelkNeeded > 0 && (
          <Text style={styles.tipText}>
            • Haal {vriesmelkNeeded}ml uit vriezer
          </Text>
        )}
        {kunstvoedingNeeded > 0 && (
          <Text style={styles.tipText}>
            • Bereid {kunstvoedingNeeded}ml kunstvoeding voor
          </Text>
        )}
        {isVoldoende && (
          <Text style={[styles.tipText, { color: '#4CAF50' }]}>
            • Je voorraad is voldoende!
          </Text>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3F414E',
    marginLeft: 8,
    fontFamily: 'Poppins',
  },
  planningSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F414E',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  feedList: {
    gap: 8,
  },
  feedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F9',
    borderRadius: 8,
  },
  feedTime: {
    fontSize: 14,
    color: '#3F414E',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  feedAmount: {
    fontSize: 14,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
  },
  feedSource: {
    flexDirection: 'row',
    gap: 8,
  },
  sourceText: {
    fontSize: 12,
    color: '#F49B9B',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  voorraadSection: {
    marginBottom: 20,
  },
  voorraadItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F9',
    borderRadius: 12,
  },
  voorraadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voorraadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F414E',
    fontFamily: 'Poppins',
  },
  voorraadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  voorraadDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voorraadText: {
    fontSize: 14,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
  },
  needText: {
    fontSize: 14,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins',
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

export default MelkVoorraadManager;
