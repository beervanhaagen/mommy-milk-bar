import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PlusIcon, DeleteIcon } from './icons/PlanningIcons';
import Svg, { Path } from 'react-native-svg';

const EditIcon = ({ size = 16, color = '#F49B9B' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
import { drinkTypes } from '../data/drinkTypes';
import { CustomDrinkInput } from './CustomDrinkInput';

interface SlimmeDrankjePlannerProps {
  onDrinksChange: (drinks: PlannedDrink[]) => void;
  baseDate?: Date; // date of planning; times 00:00-03:00 roll to next day
  lateNightCutoffHours?: number; // default 3
  initialTime?: Date; // planner start time to prime first drink time picker
  initialDrinks?: PlannedDrink[]; // initial drinks for editing
}

export interface PlannedDrink {
  id: string;
  type: string;
  time: Date;
  amount: number;
}

const timeIntervals = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 uur', value: 60 },
  { label: '1,5 uur', value: 90 },
];

// Feature flag to allow quick revert to previous UI
const NEW_PLANNER_UI = true;

const SlimmeDrankjePlanner: React.FC<SlimmeDrankjePlannerProps> = ({ onDrinksChange, baseDate, lateNightCutoffHours = 3, initialTime, initialDrinks }) => {
  const [drinks, setDrinks] = useState<PlannedDrink[]>([]);
  // Inline add flow (geen modal)
  const [selectedType, setSelectedType] = useState('wine');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedInterval, setSelectedInterval] = useState<number | null>(null);
  const [mode, setMode] = useState<'per' | 'bulk'>('per');
  const [bulkCount, setBulkCount] = useState<number>(1); // 1..20
  const [bulkIntervalMin, setBulkIntervalMin] = useState<number | null>(null); // 30/45/60/90
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [customAlcohol, setCustomAlcohol] = useState({ percentage: 12, volume: 150 });
  // Edit time state
  const [editingDrinkId, setEditingDrinkId] = useState<string | null>(null);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const [editTempTime, setEditTempTime] = useState(new Date());

  // Load initial drinks when provided
  React.useEffect(() => {
    if (initialDrinks && initialDrinks.length > 0) {
      // Convert time strings to Date objects if needed
      const convertedDrinks = initialDrinks.map(drink => ({
        ...drink,
        time: drink.time instanceof Date ? drink.time : new Date(drink.time),
      }));
      setDrinks(convertedDrinks);
    }
  }, [initialDrinks]);

  // Sync selectedTime with initialTime when provided/updated
  React.useEffect(() => {
    if (initialTime) {
      setSelectedTime(initialTime);
    }
  }, [initialTime]);

  const addDrink = () => {
    const newDrink: PlannedDrink = {
      id: Date.now().toString(),
      type: selectedType,
      time: (() => {
        // Combine baseDate (if provided) with selectedTime, rolling to next day if early morning
        if (!baseDate) return selectedTime;
        const combined = new Date(baseDate);
        combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        if (selectedTime.getHours() < lateNightCutoffHours) {
          combined.setDate(combined.getDate() + 1);
        }
        return combined;
      })(),
      amount: 1, // Altijd 1 glas per keer
    };

    const updatedDrinks = [...drinks, newDrink].sort((a, b) => a.time.getTime() - b.time.getTime());
    setDrinks(updatedDrinks);
    onDrinksChange(updatedDrinks);
    // Na toevoegen: zet de geselecteerde tijd op de tijd van het zojuist toegevoegde drankje
    setSelectedTime(newDrink.time);
    
    // Reset form (we houden geselecteerde tijd aan voor sneller toevoegen)
    resetForm();
  };

  // Generate follow-up drinks 2..N relative to T0
  const generateBulkFromT0 = (t0: Date, count: number, intervalMin: number): PlannedDrink[] => {
    const generated: PlannedDrink[] = [];
    const safeCount = Math.min(Math.max(1, count), 20);
    for (let i = 2; i <= safeCount; i++) {
      const next = new Date(t0);
      next.setMinutes(next.getMinutes() + intervalMin * (i - 1));
      const drink: PlannedDrink = {
        id: `${t0.getTime()}-${i}`,
        type: selectedType,
        time: (() => {
          if (!baseDate) return next;
          const combined = new Date(baseDate);
          combined.setHours(next.getHours(), next.getMinutes(), 0, 0);
          if (next.getHours() < lateNightCutoffHours) {
            combined.setDate(combined.getDate() + 1);
          }
          return combined;
        })(),
        amount: 1,
      };
      generated.push(drink);
    }
    return generated;
  };

  // Whenever bulk controls change and we have a T0 in list, regenerate sequence
  React.useEffect(() => {
    if (!bulkIntervalMin || bulkCount <= 1) return;
    if (drinks.length === 0) return;
    // T0 = earliest drink in list
    const t0Drink = [...drinks].sort((a, b) => a.time.getTime() - b.time.getTime())[0];
    const others = drinks.filter(d => d.id !== t0Drink.id);
    const generated = generateBulkFromT0(t0Drink.time, bulkCount, bulkIntervalMin);
    const merged = [t0Drink, ...generated];
    setDrinks(merged);
    onDrinksChange(merged);
    // keep selectedTime on last generated for convenience
    if (generated.length > 0) setSelectedTime(generated[generated.length - 1].time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkCount, bulkIntervalMin]);

  const handleBulkApply = () => {
    if (!bulkIntervalMin || bulkCount < 1) return;
    // Ensure first drink (T0) exists at selectedTime
    let t0Drink = [...drinks].sort((a, b) => a.time.getTime() - b.time.getTime())[0];
    if (!t0Drink) {
      const t0: PlannedDrink = {
        id: Date.now().toString(),
        type: selectedType,
        time: (() => {
          if (!baseDate) return selectedTime;
          const combined = new Date(baseDate);
          combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
          if (selectedTime.getHours() < lateNightCutoffHours) {
            combined.setDate(combined.getDate() + 1);
          }
          return combined;
        })(),
        amount: 1,
      };
      t0Drink = t0;
    }
    const generated = generateBulkFromT0(t0Drink.time, bulkCount, bulkIntervalMin);
    const merged = [t0Drink, ...generated];
    setDrinks(merged);
    onDrinksChange(merged);
  };



  const deleteDrink = (drinkId: string) => {
    const updatedDrinks = drinks.filter(drink => drink.id !== drinkId);
    setDrinks(updatedDrinks);
    onDrinksChange(updatedDrinks);
  };

  const startEditDrink = (drinkId: string) => {
    const drink = drinks.find(d => d.id === drinkId);
    if (drink) {
      setEditingDrinkId(drinkId);
      setEditTempTime(drink.time);
      setShowEditTimePicker(true);
    }
  };

  const confirmEditTime = () => {
    if (editingDrinkId) {
      const updatedDrinks = drinks.map(drink =>
        drink.id === editingDrinkId
          ? { ...drink, time: editTempTime }
          : drink
      ).sort((a, b) => a.time.getTime() - b.time.getTime());
      setDrinks(updatedDrinks);
      onDrinksChange(updatedDrinks);
    }
    setShowEditTimePicker(false);
    setEditingDrinkId(null);
  };

  const cancelEditTime = () => {
    setShowEditTimePicker(false);
    setEditingDrinkId(null);
  };

  const resetForm = () => {
    setSelectedType('wine');
    setSelectedInterval(null);
  };

  const getDrinkIcon = (type: string) => {
    const drinkType = drinkTypes[type];
    const IconComponent = drinkType?.icon;
    return IconComponent ? <IconComponent size={20} /> : '🍷';
  };

  const getDrinkName = (type: string) => {
    const drinkType = drinkTypes[type];
    return drinkType?.label || 'Onbekend';
  };

  const calculateTotalStandardDrinks = () => {
    return drinks.reduce((total, drink) => {
      const drinkType = drinkTypes[drink.type];
      const unitsPerGlass = drinkType?.unitsPerGlass || 1.0;
      return total + unitsPerGlass; // Altijd 1 glas per drankje
    }, 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wat drink je?</Text>
      {NEW_PLANNER_UI && (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setMode('per')} style={[styles.segment, mode === 'per' && styles.segmentActive]}>
            <Text style={[styles.segmentText, mode === 'per' && styles.segmentTextActive]}>Per drankje</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('bulk')} style={[styles.segment, mode === 'bulk' && styles.segmentActive]}>
            <Text style={[styles.segmentText, mode === 'bulk' && styles.segmentTextActive]}>Meerdere drankjes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Drink type selectie – zelfde opzet als 'drankje loggen' */}
      <View style={styles.section}>
        <View style={styles.drinkTypeGrid}>
          {Object.values(drinkTypes).map((drink) => {
            const IconComponent = drink.icon;
            return (
              <TouchableOpacity
                key={drink.id}
                style={[
                  styles.drinkTypeButton,
                  selectedType === drink.id && styles.drinkTypeButtonSelected
                ]}
                onPress={() => setSelectedType(drink.id)}
              >
                <IconComponent size={24} />
                <Text style={[
                  styles.drinkTypeText,
                  selectedType === drink.id && styles.drinkTypeTextSelected
                ]}>
                  {drink.label}
                </Text>
                <Text style={[
                  styles.drinkAlcohol,
                  selectedType === drink.id && { color: '#FFFFFF' }
                ]}>
                  {drink.isCustom ? 'Custom' : `${drink.abv}% alcohol`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tijd kiezen + toevoegen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {mode === 'bulk' ? 'Starttijd' : 'Tijd van dit drankje'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => {
              setTempTime(selectedTime);
              setShowTimePicker(true);
            }}
          >
            <Text style={styles.timeButtonText}>
              {selectedTime.toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </TouchableOpacity>
          {(!NEW_PLANNER_UI || mode === 'per') && (
            <TouchableOpacity style={styles.addInlineButton} onPress={addDrink}>
              <Text style={styles.addInlineButtonText}>Toevoegen</Text>
            </TouchableOpacity>
          )}
          {NEW_PLANNER_UI && mode === 'bulk' && (
            <TouchableOpacity style={styles.addInlineButton} onPress={handleBulkApply}>
              <Text style={styles.addInlineButtonText}>Genereren</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Meerdere drankjes? – Aantal × Interval */}
      {(!NEW_PLANNER_UI || mode === 'bulk') && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meerdere drankjes?</Text>
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontFamily: 'Poppins', color: '#7A6C66' }}>Aantal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
              <TouchableOpacity
                key={n}
                onPress={() => setBulkCount(n)}
                style={[styles.intervalButton, bulkCount === n && styles.intervalButtonSelected]}
              >
                <Text style={[styles.intervalText, bulkCount === n && styles.intervalTextSelected]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View>
          <Text style={{ fontFamily: 'Poppins', color: '#7A6C66' }}>Interval</Text>
          <View style={styles.intervalContainer}>
            {[30, 45, 60, 90].map(min => (
              <TouchableOpacity
                key={min}
                onPress={() => setBulkIntervalMin(min)}
                style={[styles.intervalButton, bulkIntervalMin === min && styles.intervalButtonSelected]}
              >
                <Text style={[styles.intervalText, bulkIntervalMin === min && styles.intervalTextSelected]}>
                  {min === 60 ? '60 min' : min === 90 ? '90 min' : `${min} min`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Samenvatting */}
        {drinks.length > 0 && bulkCount >= 1 && bulkIntervalMin && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontFamily: 'Poppins', color: '#7A6C66', textAlign: 'center' }}>
              Je plant {bulkCount} drankjes, elke {bulkIntervalMin} min:
              {' '}
              {drinks
                .slice(0, bulkCount)
                .map(d => d.time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }))
                .join(', ')}
            </Text>
          </View>
        )}
      </View>
      )}

      {/* Custom drink input onder tijd indien 'overig' */}
      {selectedType === 'other' && (
        <View style={styles.section}>
          <CustomDrinkInput onAlcoholChange={(percentage: number, volume: number) => setCustomAlcohol({ percentage, volume })} />
        </View>
      )}

      {/* Planned Drinks Overview */}
      {drinks.length > 0 && (
        <View style={styles.plannedDrinksSection}>
          <Text style={styles.plannedDrinksTitle}>Geplande drankjes</Text>
          <View style={styles.drinksList}>
            {drinks.map((drink) => (
              <View key={drink.id} style={styles.drinkItem}>
                <View style={styles.drinkInfo}>
                  {getDrinkIcon(drink.type)}
                  <View style={styles.drinkDetails}>
                    <Text style={styles.drinkName}>{getDrinkName(drink.type)}</Text>
                    <Text style={styles.drinkTime}>
                      {drink.time.toLocaleTimeString('nl-NL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.drinkActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => startEditDrink(drink.id)}
                  >
                    <EditIcon size={16} color="#7A9DE8" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteDrink(drink.id)}
                  >
                    <DeleteIcon size={16} color="#F49B9B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {drinks.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Totaal: {calculateTotalStandardDrinks().toFixed(1)} standaard glazen
          </Text>
        </View>
      )}
      {/* Tijd overlay picker */}
      {showTimePicker && (
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>Tijd selecteren</Text>
            <DateTimePicker
              value={tempTime}
              mode="time"
              display="spinner"
              style={styles.timePicker}
              onChange={(event, date) => {
                if (date) setTempTime(date);
              }}
            />
            <View style={styles.timePickerActions}>
              <TouchableOpacity
                style={styles.timePickerCancelButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.timePickerCancelText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerConfirmButton}
                onPress={() => {
                  setSelectedTime(tempTime);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.timePickerConfirmText}>Bevestigen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Edit tijd overlay picker */}
      {showEditTimePicker && (
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>Tijd aanpassen</Text>
            <DateTimePicker
              value={editTempTime}
              mode="time"
              display="spinner"
              style={styles.timePicker}
              onChange={(event, date) => {
                if (date) setEditTempTime(date);
              }}
            />
            <View style={styles.timePickerActions}>
              <TouchableOpacity
                style={styles.timePickerCancelButton}
                onPress={cancelEditTime}
              >
                <Text style={styles.timePickerCancelText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerConfirmButton}
                onPress={confirmEditTime}
              >
                <Text style={styles.timePickerConfirmText}>Bevestigen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  plannedDrinksSection: {
    marginBottom: 20,
  },
  plannedDrinksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3B36',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  drinksList: {
    marginBottom: 16,
  },
  drinkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  drinkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drinkIcon: {
    fontSize: 20,
    marginRight: 38,
  },
  drinkDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drinkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3B36',
    fontFamily: 'Poppins',
    flex: 1,
  },
  drinkTime: {
    fontSize: 14,
    color: '#F49B9B',
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginLeft: 12,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  drinkAmount: {
    fontSize: 12,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
  },
  drinkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addInlineButton: {
    backgroundColor: '#F49B9B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addInlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  segmentActive: {
    borderColor: '#F49B9B',
    backgroundColor: '#FFECEF',
  },
  segmentText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    color: '#7A6C66',
  },
  segmentTextActive: {
    color: '#F49B9B',
  },
  summary: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F9',
  },
  summaryText: {
    fontSize: 14,
    color: '#A1A4B2',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxHeight: '85%',
    width: '90%',
    flex: 1,
  },
  addFormContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  addFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B3B36',
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  modalScrollView: {
    flex: 1,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3F414E',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F414E',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  drinkTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  drinkTypeButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E1E6',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    justifyContent: 'center',
    marginBottom: 8,
  },
  drinkTypeButtonSelected: {
    backgroundColor: '#F49B9B',
    borderColor: '#F49B9B',
  },
  drinkTypeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  drinkTypeText: {
    fontSize: 14,
    color: '#4B3B36',
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  drinkTypeTextSelected: {
    color: '#FFFFFF',
  },
  drinkAlcohol: {
    fontSize: 12,
    color: '#8E8B88',
    fontFamily: 'Poppins',
    fontWeight: '400',
    marginTop: 2,
    textAlign: 'center',
  },
  timeButton: {
    backgroundColor: '#F5F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#3F414E',
    fontFamily: 'Poppins',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  amountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3F414E',
    fontFamily: 'Poppins',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F9',
  },
  addFormActions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F0FF',
  },
  addFormButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  intervalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E1E6',
    backgroundColor: '#FFFFFF',
    minWidth: 60,
    alignItems: 'center',
  },
  intervalButtonSelected: {
    backgroundColor: '#F49B9B',
    borderColor: '#F49B9B',
  },
  intervalText: {
    fontSize: 14,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  intervalTextSelected: {
    color: '#FFFFFF',
  },
  addMoreButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F49B9B',
    alignItems: 'center',
    marginBottom: 4,
  },
  addMoreButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E6',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#F49B9B',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 300,
    width: '90%',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B3B36',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  timePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  timePickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  timePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E6',
    alignItems: 'center',
  },
  timePickerCancelText: {
    fontSize: 16,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  timePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F49B9B',
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  modalDrinksList: {
    marginBottom: 8,
  },
  modalDrinkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  modalDrinkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalDrinkDetails: {
    flex: 1,
    marginLeft: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDrinkName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B3B36',
    fontFamily: 'Poppins',
    flex: 1,
  },
  modalDrinkTime: {
    fontSize: 12,
    color: '#F49B9B',
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  modalDrinkActions: {
    flexDirection: 'row',
    gap: 4,
  },
  modalActionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});

export default SlimmeDrankjePlanner;
