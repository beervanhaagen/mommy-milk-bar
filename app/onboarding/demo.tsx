import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, Modal } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import DateTimePicker from '@react-native-community/datetimepicker';
import { AnimatedBackground } from "../../src/components/AnimatedBackground";
import { hoursPerStdDrink } from "../../src/lib/alcohol";
import { useStore } from "../../src/state/store";

const { width, height } = Dimensions.get('window');

export default function Demo() {
  const router = useRouter();
  const { getProfile } = useStore();
  const profile = getProfile();
  const [glasses, setGlasses] = useState(1);
  const [startTime, setStartTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [countdown, setCountdown] = useState("00:00:00");
  const [mimiState, setMimiState] = useState("7_closed_mimi_png_2");
  const [alcoholInBlood, setAlcoholInBlood] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Use precise LactMed nomogram calculation based on user's weight
  const calculateEndTime = (start: Date, glasses: number) => {
    const hoursPerGlass = hoursPerStdDrink(profile.weightKg) * (profile.conservativeFactor ?? 1.0);
    const totalHours = glasses * hoursPerGlass;
    const end = new Date(start.getTime() + totalHours * 60 * 60 * 1000);
    return end;
  };

  // Update end time when glasses or start time changes
  useEffect(() => {
    const newEndTime = calculateEndTime(startTime, glasses);
    setEndTime(newEndTime);
  }, [startTime, glasses]);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const remaining = endTime.getTime() - now.getTime();
      
      if (remaining > 0) {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        setAlcoholInBlood(true);
        
        // Dynamic Mimi states based on countdown
        const totalMinutes = Math.floor(remaining / (1000 * 60));
        if (totalMinutes < 60) {
          setMimiState("2_mimi_happy"); // Almost ready (< 1 hour)
        } else if (totalMinutes < 120) {
          setMimiState("4_nogniet_2"); // < 2 hours
        } else {
          setMimiState("7_closed_mimi_png_2"); // < 3 hours
        }
      } else {
        setCountdown("00:00:00");
        setAlcoholInBlood(false);
        setMimiState("Milkbar_open_1"); // Ready!
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const handleNext = () => {
    router.push('/');
  };

  const handleSliderChange = (value: number) => {
    setGlasses(Math.max(1, Math.min(5, Math.round(value))));
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    const newTime = new Date();
    newTime.setHours(hours, minutes, 0, 0);
    setStartTime(newTime);
    setShowTimePicker(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getMimiAsset = () => {
    switch (mimiState) {
      case "2_mimi_happy":
        return require('../../assets/Mimi_karakters/2_mimi_happy_2.png');
      case "4_nogniet_2":
        return require('../../assets/Mimi_karakters/4_nogniet_2.png');
      case "7_closed_mimi_png_2":
        return require('../../assets/Mimi_karakters/7_Closed_mimi_png.png');
      case "Milkbar_open_1":
        return require('../../assets/Mimi_karakters/Milkbar_open_1.png');
      default:
        return require('../../assets/Mimi_karakters/7_Closed_mimi_png.png');
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="variant4" />

      {/* Fixed header with back button */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" fill="#F49B9B"/>
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Mimi Character - Dynamic - FIXED POSITION ABOVE CARD */}
      <View style={styles.mimiContainer}>
        <Image 
          source={getMimiAsset()} 
          style={styles.mimiImage}
          resizeMode="contain"
        />
      </View>

      {/* Interactive Card */}
      <View style={styles.card}>
        {/* Start Time - EDITABLE */}
        <View style={styles.timeRow}>
          <Text style={styles.startTimeLabel}>Starttijd:</Text>
          <TouchableOpacity 
            style={styles.startTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.startTimeText}>{formatTime(startTime)}</Text>
          </TouchableOpacity>
        </View>

        {/* End Time - CALCULATED */}
        <View style={styles.timeRow}>
          <Text style={styles.endTimeLabel}>Eindtijd:</Text>
          <View style={styles.endTimeButton}>
            <Text style={styles.endTimeText}>{formatTime(endTime)}</Text>
          </View>
        </View>

        {/* Alcohol Selector - PLUS/MINUS BUTTONS */}
        <Text style={styles.alcoholLabel}>Aantal glazen alcohol:</Text>
        
        <View style={styles.alcoholSelector}>
          <TouchableOpacity 
            style={styles.minusButton}
            onPress={() => setGlasses(Math.max(1, glasses - 1))}
          >
            <Text style={styles.iconButtonText}>−</Text>
          </TouchableOpacity>
          
          <Text style={styles.alcoholValue}>{glasses}</Text>
          
          <TouchableOpacity 
            style={styles.plusButton}
            onPress={() => setGlasses(Math.min(5, glasses + 1))}
          >
            <Text style={styles.iconButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Alcohol Warning Label - INSIDE CARD */}
        <View style={[styles.warningLabelInCard, { backgroundColor: alcoholInBlood ? '#FFE8E8' : '#E8F8F1' }]}>
          <Text style={[styles.warningIcon, { color: alcoholInBlood ? '#C63838' : '#27ae60' }]}>
            {alcoholInBlood ? "✕" : "✓"}
          </Text>
          <Text style={[styles.warningTextInCard, { color: alcoholInBlood ? '#E47C7C' : '#27ae60' }]}>
            {alcoholInBlood 
              ? "Alcohol in bloed - geen voeding"
              : "Veilig om te voeden"
            }
          </Text>
        </View>

        {/* Countdown Section - DIRECTLY BELOW WARNING */}
        <View style={styles.countdownSection}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      </View>

      {/* iOS Time Picker Modal */}
      {showTimePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerHeader}>
                <TouchableOpacity 
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.timePickerButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <Text style={styles.timePickerTitle}>Starttijd</Text>
                <TouchableOpacity 
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.timePickerButtonText}>Gereed</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setStartTime(selectedTime);
                  }
                }}
                style={styles.timePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Doorgaan</Text>
      </TouchableOpacity>

      {/* Bottom Line */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
    position: 'relative',
    width: width,
    height: height,
  },
  // removed progress bar styles
  warningLabelInCard: {
    marginTop: 20,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  warningIcon: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  warningTextInCard: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  mimiContainer: {
    position: 'absolute',
    left: width * 0.2684,
    right: width * 0.2613,
    top: 160, // More space from top
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  mimiImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    position: 'absolute',
    width: 360, // Even wider for better spacing
    height: 350, // Much taller to fit warning label + countdown
    left: (width - 360) / 2, // Perfect centered
    top: 380, // Moved up a bit to fit everything
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Softer corners
    padding: 28, // More padding for better content spacing
    shadowColor: '#F49B9B', // Mommy Milk Bar shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Better spacing for the larger container
  },
  startTimeLabel: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 26,
    color: '#1DADF0',
  },
  startTimeButton: {
    width: 70, // Consistent size
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1DADF0',
    shadowColor: '#1DADF0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  startTimeText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: '#1DADF0',
  },
  endTimeLabel: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 26,
    color: '#7A6C66',
  },
  endTimeButton: {
    width: 70, // Same size as starttijd
    height: 32,
    backgroundColor: 'transparent', // No background color
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6', // Subtle border
  },
  endTimeText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    color: '#7A6C66', // Dark gray like rest of app
  },
  alcoholLabel: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#8E8B88',
    marginTop: 10,
  },
  alcoholSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12, // Better spacing for the larger container
  },
  minusButton: {
    width: 32, // Much smaller
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F49B9B', // Soft pink like Doorgaan button
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  plusButton: {
    width: 32, // Much smaller
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F49B9B', // Soft pink like Doorgaan button
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  iconButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#FFFFFF', // White text on pink buttons
  },
  alcoholValue: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 32,
    textAlign: 'center',
    color: '#4B3B36',
    minWidth: 28,
  },
  sliderContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  sliderTrack: {
    width: 200,
    height: 2,
    backgroundColor: '#D9D9D9',
    borderRadius: 1,
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#F49B9B',
    borderRadius: 12,
    top: -10,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  countdownSection: {
    alignItems: 'center',
    marginTop: 12, // Less spacing - directly below warning
  },
  countdownText: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32, // Bigger for more prominence
    lineHeight: 40,
    textAlign: 'center',
    color: '#4B3B36',
  },
  button: {
    position: 'absolute',
    width: 374,
    height: 63,
    left: (width - 374) / 2,
    top: 769,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  fixedHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Time Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  timePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timePickerButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#F49B9B',
  },
  timePickerTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#4B3B36',
  },
  timePicker: {
    height: 200,
  },
});
