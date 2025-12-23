import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimeSelectorProps {
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedTime, onTimeChange }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const quickOptions = [
    {
      id: 'tonight',
      label: 'Vanavond',
      time: '20:00',
      icon: '🌙',
      description: 'Na bedritueel',
      date: (() => {
        const date = new Date();
        date.setHours(20, 0, 0, 0);
        return date;
      })()
    },
    {
      id: 'tomorrow',
      label: 'Morgenavond', 
      time: '20:00',
      icon: '☀️',
      description: 'Morgen',
      date: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(20, 0, 0, 0);
        return date;
      })()
    },
    {
      id: 'weekend',
      label: 'Weekend',
      time: '19:00',
      icon: '🎈',
      description: 'Zaterdag',
      date: (() => {
        const date = new Date();
        date.setDate(date.getDate() + (6 - date.getDay()));
        date.setHours(19, 0, 0, 0);
        return date;
      })()
    }
  ];

  const isSelected = (option: any) => {
    return Math.abs(selectedTime.getTime() - option.date.getTime()) < 60000; // Within 1 minute
  };

  const handleQuickSelect = (option: any) => {
    onTimeChange(option.date);
  };

  const handleCustomTime = () => {
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    // On iOS, only close when user confirms (event.type === 'set')
    // On Android, the picker auto-closes so we always process
    const isConfirmed = event?.type === 'set' || event?.type === undefined;

    if (isConfirmed) {
      setShowTimePicker(false);
      if (date) {
        onTimeChange(date);
      }
    } else if (event?.type === 'dismissed') {
      setShowTimePicker(false);
    }
  };

  return (
    <View style={styles.timeSelector}>
      <Text style={styles.sectionTitle}>Startmoment</Text>
      <Text style={styles.sectionSubtext}>Wanneer denk je te gaan drinken?</Text>
      
      {/* Quick Options as Pills */}
      <View style={styles.quickOptions}>
        {quickOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.pillButton,
              isSelected(option) && styles.pillButtonActive
            ]}
            onPress={() => handleQuickSelect(option)}
          >
            <Text style={styles.pillIcon}>{option.icon}</Text>
            <View style={styles.pillContent}>
              <Text style={[
                styles.pillLabel,
                isSelected(option) && styles.pillLabelActive
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.pillTime,
                isSelected(option) && styles.pillTimeActive
              ]}>
                {option.time} • {option.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Time Option */}
      <TouchableOpacity style={styles.customTimeButton} onPress={handleCustomTime}>
        <Text style={styles.customTimeText}>Kies handmatig tijdstip</Text>
        <Text style={styles.customTimeValue}>
          {selectedTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
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
  );
};

const styles = StyleSheet.create({
  timeSelector: {
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
    marginBottom: 16,
  },
  quickOptions: {
    marginBottom: 16,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F0FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pillButtonActive: {
    backgroundColor: '#9BB9F4',
    borderColor: '#7A9DE8',
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pillIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  pillContent: {
    flex: 1,
  },
  pillLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3C33',
    marginBottom: 2,
  },
  pillLabelActive: {
    color: '#FFFFFF',
  },
  pillTime: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#7C6D63',
  },
  pillTimeActive: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  customTimeButton: {
    backgroundColor: '#9BB9F4',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#9BB9F4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  customTimeText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  customTimeValue: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});