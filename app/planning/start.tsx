import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrinkPlan } from '../../src/types/planning';

const { width, height } = Dimensions.get('window');

export default function PlanDrinkStartScreen() {
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const quickOptions = [
    {
      id: 'tonight',
      label: 'Vanavond',
      icon: '🌙',
      time: (() => {
        const date = new Date();
        date.setHours(20, 0, 0, 0);
        return date;
      })(),
      description: '20:00 — na bedritueel'
    },
    {
      id: 'tomorrow',
      label: 'Morgenavond', 
      icon: '🌤',
      time: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(20, 0, 0, 0);
        return date;
      })(),
      description: '20:00 — morgen'
    },
    {
      id: 'weekend',
      label: 'Weekend',
      icon: '🎈',
      time: (() => {
        const date = new Date();
        date.setDate(date.getDate() + (6 - date.getDay()));
        date.setHours(19, 0, 0, 0);
        return date;
      })(),
      description: 'Zaterdag 19:00'
    }
  ];

  const handleQuickSelect = (time: Date) => {
    setSelectedTime(time);
    const plan: Partial<DrinkPlan> = {
      startAt: time,
      drinks: 1,
      pace: 'TWO_HOURS',
      drinkType: 'WINE',
      goal: 'MIN_FREEZER',
      canPreFeed: true,
      canMicroPump: true,
      microPumpTargetMl: 80,
      safetyBufferMin: 30
    };
    router.push({
      pathname: '/planning/details',
      params: { planData: JSON.stringify(plan) }
    });
  };

  const handleCustomTime = () => {
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    // On iOS, only close and navigate when user confirms (event.type === 'set')
    // On Android, the picker auto-closes so we always process
    const isConfirmed = event?.type === 'set' || event?.type === undefined;

    if (isConfirmed) {
      setShowTimePicker(false);
      if (selectedDate) {
        setSelectedTime(selectedDate);
        const plan: Partial<DrinkPlan> = {
          startAt: selectedDate,
          drinks: 1,
          pace: 'TWO_HOURS',
          drinkType: 'WINE',
          goal: 'MIN_FREEZER',
          canPreFeed: true,
          canMicroPump: true,
          microPumpTargetMl: 80,
          safetyBufferMin: 30
        };
        router.push({
          pathname: '/planning/details',
          params: { planData: JSON.stringify(plan) }
        });
      }
    } else if (event?.type === 'dismissed') {
      setShowTimePicker(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
        <Text style={styles.progressText}>Stap 1 van 3</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Wanneer denk je iets te drinken?</Text>
          <Text style={styles.subtitle}>We plannen samen even slim, zodat jij straks écht kunt ontspannen</Text>
        </View>

        {/* Quick Options */}
        <View style={styles.quickOptions}>
          {quickOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.quickOption}
              onPress={() => handleQuickSelect(option.time)}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Time Option */}
        <TouchableOpacity style={styles.customOption} onPress={handleCustomTime}>
          <View style={styles.customHeader}>
            <Text style={styles.customIcon}>⏰</Text>
            <Text style={styles.customLabel}>Kies datum & tijd</Text>
          </View>
          <Text style={styles.customDescription}>
            {selectedTime.toLocaleDateString('nl-NL', { 
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="datetime"
            display="default"
            onChange={handleTimeChange}
            minimumDate={new Date()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FF',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#D1E0FF',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#7A9DE8',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    color: '#7A6C66',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    color: '#4B3C33',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#7A6C66',
    textAlign: 'center',
  },
  quickOptions: {
    marginBottom: 24,
  },
  quickOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
    color: '#4B3C33',
  },
  optionDescription: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    marginLeft: 36,
  },
  customOption: {
    backgroundColor: '#9BB9F4',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  customLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
    color: '#FFFFFF',
  },
  customDescription: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
});
