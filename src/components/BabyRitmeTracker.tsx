import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BabyRitmeTrackerProps {
  onFeedsChange: (feeds: FeedPrediction[]) => void;
  defaultLastFeedTime?: Date;
  onLastFeedTimeChange?: (t: Date) => void;
  onFeedIntervalChange?: (hours: number) => void;
}

export interface FeedPrediction {
  time: Date;
  amount: number;
  confidence: number;
  type: 'predicted' | 'manual';
}

const BabyRitmeTracker: React.FC<BabyRitmeTrackerProps> = ({ onFeedsChange, defaultLastFeedTime, onLastFeedTimeChange, onFeedIntervalChange }) => {
  const [lastFeedTime, setLastFeedTime] = useState(defaultLastFeedTime || new Date());
  const [feedInterval, setFeedInterval] = useState(3); // hours
  const [predictions, setPredictions] = useState<FeedPrediction[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [tempInterval, setTempInterval] = useState(3);

  // Calculate predictions based on last feed
  const calculatePredictions = useCallback(() => {
    const newPredictions: FeedPrediction[] = [];
    const now = new Date();
    
    // Generate predictions for next 12 hours
    for (let i = 1; i <= 4; i++) {
      const nextFeedTime = new Date(lastFeedTime);
      nextFeedTime.setHours(nextFeedTime.getHours() + (feedInterval * i));
      
      // Calculate confidence based on time since last feed
      const hoursSinceLastFeed = (now.getTime() - lastFeedTime.getTime()) / (1000 * 60 * 60);
      const confidence = Math.max(0.6, Math.min(0.95, 0.8 + (hoursSinceLastFeed / 24) * 0.15));
      
      newPredictions.push({
        time: nextFeedTime,
        amount: 120, // Default amount
        confidence,
        type: 'predicted'
      });
    }
    
    setPredictions(newPredictions);
    onFeedsChange(newPredictions);
  }, [lastFeedTime, feedInterval, onFeedsChange]);

  // Only adopt defaultLastFeedTime when it actually changes (e.g., startTime changed)
  const prevDefaultMsRef = useRef<number | null>(null);
  useEffect(() => {
    if (!defaultLastFeedTime) return;
    const incomingMs = defaultLastFeedTime.getTime();
    if (prevDefaultMsRef.current === null || prevDefaultMsRef.current !== incomingMs) {
      // Only set when the prop meaningfully changed; don't override manual edits
      setLastFeedTime(new Date(incomingMs));
      prevDefaultMsRef.current = incomingMs;
    }
  }, [defaultLastFeedTime]);

  useEffect(() => {
    calculatePredictions();
  }, [calculatePredictions]);

  const getFeedingStatus = (prediction: FeedPrediction) => {
    const now = new Date();
    const timeDiff = (prediction.time.getTime() - now.getTime()) / (1000 * 60 * 60); // hours
    
    // Simulate alcohol clearance (2-2.5 hours per standard drink)
    // This is a simplified calculation - in reality you'd need actual drink data
    const alcoholClearanceTime = 2.5; // hours per standard drink
    const timeSinceLastDrink = timeDiff; // This should be calculated from actual drink times
    
    if (timeSinceLastDrink >= alcoholClearanceTime) {
      return {
        status: 'Wel borstvoeding',
        color: '#4CAF50'
      };
    } else {
      return {
        status: 'Geen borstvoeding',
        color: '#F44336'
      };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Baby voedingen</Text>

      

      {/* Laatste voeding tijd */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Laatste voeding tijd</Text>
              <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => {
              setTempTime(lastFeedTime);
              setShowTimePicker(true);
            }}
          >
            <Text style={styles.timeButtonText}>
              {lastFeedTime.toLocaleTimeString('nl-NL', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Frequentie */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Frequentie</Text>
          <TouchableOpacity 
            style={styles.intervalButton}
            onPress={() => {
              setTempInterval(feedInterval);
              setShowIntervalPicker(true);
            }}
          >
            <Text style={styles.intervalButtonText}>
              Elke {feedInterval} uur
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Tijd selecteren</Text>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                style={styles.picker}
                onChange={(event, date) => {
                  if (date) setTempTime(date);
                }}
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity 
                  style={styles.pickerCancelButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.pickerCancelText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.pickerConfirmButton}
                  onPress={() => {
                    setLastFeedTime(tempTime);
                    if (onLastFeedTimeChange) onLastFeedTimeChange(tempTime);
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={styles.pickerConfirmText}>Bevestigen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Interval Picker Modal */}
      {showIntervalPicker && (
        <Modal
          visible={showIntervalPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowIntervalPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Frequentie selecteren</Text>
              <View style={styles.intervalPickerContainer}>
                <TouchableOpacity
                  style={styles.intervalPickerButton}
                  onPress={() => setTempInterval(Math.max(0.25, tempInterval - 0.25))}
                >
                  <Text style={styles.intervalPickerButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.intervalPickerText}>
                  {tempInterval === 0.25 ? '15 min' : 
                   tempInterval === 0.5 ? '30 min' :
                   tempInterval === 0.75 ? '45 min' :
                   `${tempInterval} uur`}
                </Text>
                <TouchableOpacity
                  style={styles.intervalPickerButton}
                  onPress={() => setTempInterval(Math.min(6, tempInterval + 0.25))}
                >
                  <Text style={styles.intervalPickerButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerActions}>
                <TouchableOpacity 
                  style={styles.pickerCancelButton}
                  onPress={() => setShowIntervalPicker(false)}
                >
                  <Text style={styles.pickerCancelText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.pickerConfirmButton}
                  onPress={() => {
                    setFeedInterval(tempInterval);
                    if (onFeedIntervalChange) onFeedIntervalChange(tempInterval);
                    setShowIntervalPicker(false);
                  }}
                >
                  <Text style={styles.pickerConfirmText}>Bevestigen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4B3B36',
    marginBottom: 16,
    fontFamily: 'Quicksand',
    lineHeight: 28,
  },
  section: {
    marginBottom: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3B36',
    fontFamily: 'Poppins',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8B88',
    marginBottom: 12,
    fontFamily: 'Poppins',
    fontStyle: 'italic',
  },
  timeButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F0FF',
    minWidth: 80,
  },
  timeButtonText: {
    fontSize: 14,
    color: '#4B3B36',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  intervalButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F0FF',
    minWidth: 80,
  },
  intervalButtonText: {
    fontSize: 14,
    color: '#4B3B36',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: '#8E8B88',
    fontFamily: 'Poppins',
    marginTop: 2,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F9',
  },
  predictionTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionTimeText: {
    fontSize: 16,
    color: '#4B3B36',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  predictionAmount: {
    fontSize: 14,
    color: '#F49B9B',
    marginLeft: 8,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  pickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B3B36',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  picker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E6',
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  pickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F49B9B',
    alignItems: 'center',
  },
  pickerConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  amountPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  amountPickerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F49B9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountPickerButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  amountPickerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4B3B36',
    fontFamily: 'Poppins',
  },
  intervalPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  intervalPickerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F49B9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intervalPickerButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  intervalPickerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B3B36',
    fontFamily: 'Poppins',
    textAlign: 'center',
    minWidth: 80,
  },
});

export default BabyRitmeTracker;
