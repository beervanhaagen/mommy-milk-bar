import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated, Vibration, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../../src/state/store';
import BabyRitmeTracker, { FeedPrediction } from '../../src/components/BabyRitmeTracker';
import VisuelePlanningTimeline from '../../src/components/VisuelePlanningTimeline';
import SlimmeDrankjePlanner, { PlannedDrink } from '../../src/components/SlimmeDrankjePlanner';
import SlimmeVoorspellingen from '../../src/components/SlimmeVoorspellingen';
import { PlanningTipCarousel } from '../../src/components/PlanningTipCarousel';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';


export default function SmartPlannerScreen() {
  const router = useRouter();
  const { getCurrentSession, getProfile, dispatchDrinkAction } = useStore();
  
  // State for planning
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(new Date());
  const [plannedDrinks, setPlannedDrinks] = useState<PlannedDrink[]>([]);
  const [predictedFeeds, setPredictedFeeds] = useState<FeedPrediction[]>([]);
  const [safeFeedTime, setSafeFeedTime] = useState(new Date());
  const [lastFeedTime, setLastFeedTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() - 1);
    return d;
  });
  const [strategy, setStrategy] = useState<'minimal' | 'conservative'>('minimal');
  
  // Animation state
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiAnim] = useState(new Animated.Value(0));
  const [mimiScale] = useState(new Animated.Value(0));
  const [confettiFall] = useState(new Animated.Value(0));

  const currentSession = getCurrentSession();
  const profile = getProfile();

  // Handler functions for planning components - using useCallback to prevent re-renders
  const handleDrinksChange = useCallback((drinks: PlannedDrink[]) => {
    setPlannedDrinks(drinks);
    // Stel startTime automatisch in op tijd van eerste drankje (T0)
    if (drinks && drinks.length > 0) {
      const t0 = drinks[0].time instanceof Date ? drinks[0].time : new Date((drinks as any)[0].time);
      if (!isNaN(t0.getTime())) setStartTime(t0);
    }
  }, []);

  const handleFeedsChange = useCallback((feeds: FeedPrediction[]) => {
    setPredictedFeeds(feeds);
  }, []);

  const handleSafeTimeChange = useCallback((safeTime: Date) => {
    setSafeFeedTime(safeTime);
  }, []);


  // Generate the next 7 days starting from today
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDayAbbreviation = (date: Date) => {
    const dayNames = ['ZO', 'MA', 'DI', 'WO', 'DO', 'VR', 'ZA'];
    return dayNames[date.getDay()];
  };
  // Generate horizontally scrollable upcoming dates (default 30 days)
  const getUpcomingDates = (count: number = 30) => {
    const today = new Date();
    return Array.from({ length: count }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  };

  // Full day time slots (00:00..23:45) plus late-night continuation to 03:00 next day
  const getFullDayTimeSlots = (date: Date, stepMinutes: number = 15) => {
    const slots: Date[] = [];
    const dayStart = new Date(date);
    // Start vanaf 12:00 (lunch time) ipv 00:00
    dayStart.setHours(12, 0, 0, 0);
    // Bereken tot 03:00 volgende dag: 15 uur vanaf 12:00
    const totalHours = 15;
    const totalSteps = Math.floor((totalHours * 60) / stepMinutes);
    for (let i = 0; i < totalSteps; i++) {
      const t = new Date(dayStart);
      t.setMinutes(dayStart.getMinutes() + i * stepMinutes);
      slots.push(t);
    }
    return slots;
  };

  // Keep lastFeedTime tied initially to startTime (default: 30 min before)
  useEffect(() => {
    if (!startTime) return;
    const t = new Date(startTime);
    t.setMinutes(t.getMinutes() - 30);
    setLastFeedTime(t);
  }, [startTime]);

  // Prefill planner when editing from Home (if a planning exists)
  useFocusEffect(
    useCallback(() => {
      const loadExistingPlanning = async () => {
        try {
          const raw = await AsyncStorage.getItem('mmb:planned_schedule');
          if (!raw) return;
          const parsed = JSON.parse(raw);
          if (parsed.selectedDate) setSelectedDate(new Date(parsed.selectedDate));
          if (parsed.startTime) setStartTime(new Date(parsed.startTime));
          if (Array.isArray(parsed.plannedDrinks)) setPlannedDrinks(parsed.plannedDrinks);
          if (parsed.safeFeedTime) setSafeFeedTime(new Date(parsed.safeFeedTime));
          if (parsed.lastFeedTime) setLastFeedTime(new Date(parsed.lastFeedTime));
          if (parsed.strategy === 'minimal' || parsed.strategy === 'conservative') setStrategy(parsed.strategy);
        } catch {}
      };
      loadExistingPlanning();
    }, [])
  );


  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const openDatePicker = () => {
    setTempDate(selectedDate);
    setShowDatePicker(true);
  };

  const confirmDatePicker = () => {
    setSelectedDate(tempDate);
    setShowDatePicker(false);
  };

  const cancelDatePicker = () => {
    setShowDatePicker(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleStartTimePickerOpen = () => {
    setTempStartTime(startTime);
    setShowStartTimePicker(true);
  };

  const handleStartTimeConfirm = () => {
    setStartTime(tempStartTime);
    setShowStartTimePicker(false);
  };

  const handleStartTimeCancel = () => {
    setShowStartTimePicker(false);
  };

  const handleSave = async () => {
    Vibration.vibrate(100);
    try {
      const payload = {
        plannedDrinks,
        selectedDate: selectedDate.toISOString(),
        startTime: startTime.toISOString(),
        safeFeedTime: safeFeedTime ? safeFeedTime.toISOString() : null,
        lastFeedTime: lastFeedTime ? lastFeedTime.toISOString() : null,
        strategy,
        generatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('mmb:planned_schedule', JSON.stringify(payload));
    } catch (e) {
      // swallow
    }
    setShowConfetti(true);

    // Geen fade - direct zichtbaar
    confettiAnim.setValue(1);

    // Mimi bounce animation
    Animated.sequence([
      Animated.spring(mimiScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(mimiScale, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(mimiScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti - later en 20% sneller
    setTimeout(() => {
      Animated.timing(confettiFall, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Scherm blijft staan (5 seconden), geen fade out
    setTimeout(() => {
      setShowConfetti(false);
      router.back();
    }, 5000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Drankje plannen</Text>
          <Text style={styles.subtitle}>Plan je avond en zie hoe het precies uitkomt</Text>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Main Question Container */}
          <View style={styles.section}>
            {/* Selection Card with title */}
            <View style={styles.selectionCard}>
              <Text style={styles.mainQuestion}>Wanneer ga je een drankje doen?</Text>
              {/* Date chips */}
              <Text style={styles.sectionTitle}>Datum</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {getUpcomingDates(30).map((d, idx) => {
                  const selected = d.toDateString() === selectedDate.toDateString();
                  const isTodayFlag = isToday(d);
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedDate(d)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipTopText, selected && styles.chipTopTextSelected]}>
                        {formatDayAbbreviation(d)}
                      </Text>
                      <Text style={[styles.chipBottomText, selected && styles.chipBottomTextSelected]}>
                        {d.getDate().toString().padStart(2, '0')} {d.toLocaleString('nl-NL', { month: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            {/* Tijd/starttijd is verplaatst naar "Wat drink je?" (SlimmeDrankjePlanner) voor betere UX */}
          </View>


        {/* Slimme Drankje Planner */}
        <View style={styles.section}>
          <SlimmeDrankjePlanner
            onDrinksChange={handleDrinksChange}
            baseDate={selectedDate}
            initialTime={startTime}
            initialDrinks={plannedDrinks}
          />
        </View>

        {/* Baby Ritme Tracker */}
        <View style={styles.section}>
          <BabyRitmeTracker 
            onFeedsChange={handleFeedsChange} 
            defaultLastFeedTime={lastFeedTime}
            onLastFeedTimeChange={(t: Date) => setLastFeedTime(t)}
          />
        </View>

        {/* Slimme Voorspellingen */}
        <View style={styles.section}>
          <SlimmeVoorspellingen 
            plannedDrinks={plannedDrinks}
            predictedFeeds={predictedFeeds}
            startTime={startTime}
            lastFeedTime={lastFeedTime}
            strategy={strategy}
          />
        </View>

        {/* Mimi's Planning Tips */}
        <View style={[styles.section, { alignItems: 'center' }]}>
          <PlanningTipCarousel />
        </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Planning opslaan</Text>
        </TouchableOpacity>
      </View>

      {/* Starttijd modal verwijderd */}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View style={styles.timePickerModal}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>Datum selecteren</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              style={styles.timePicker}
              onChange={(event, date) => {
                if (date) setTempDate(date);
              }}
            />
            <View style={styles.timePickerActions}>
              <TouchableOpacity 
                style={styles.timePickerCancelButton}
                onPress={cancelDatePicker}
              >
                <Text style={styles.timePickerCancelText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.timePickerConfirmButton}
                onPress={confirmDatePicker}
              >
                <Text style={styles.timePickerConfirmText}>Bevestigen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


      {/* Full-screen success splash */}
      {showConfetti && (
        <Animated.View style={[styles.successSplash, { opacity: confettiAnim }]}>
          {/* Milky white background with pink spheres */}
          <AnimatedBackground variant="variant2" />

          {/* Darker pink confetti pieces - van hoger, langzamer */}
          {Array.from({ length: 60 }).map((_, i) => {
            const colors = ['#F49B9B', '#E8797A', '#D95F61', '#FA9795', '#FFB4A8'];
            const color = colors[i % colors.length];
            const size = Math.random() * 14 + 6;
            const left = Math.random() * 100;
            const fallDistance = 1000 + Math.random() * 500;
            const rotation = Math.random() * 720 - 360;
            const startDelay = Math.random() * 300;

            return (
              <Animated.View
                key={i}
                style={[
                  styles.confettiPiece,
                  {
                    backgroundColor: color,
                    width: size,
                    height: size,
                    left: `${left}%`,
                    transform: [
                      {
                        translateY: confettiFall.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-300 - startDelay, fallDistance],
                        }),
                      },
                      {
                        rotate: confettiFall.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${rotation}deg`],
                        }),
                      },
                    ],
                  },
                ]}
              />
            );
          })}

          {/* Success messages */}
          <View style={styles.successTextContainer}>
            {/* Roze celebration tekst - boven Mimi */}
            <View style={styles.celebrationTextContainer}>
              <Text style={styles.celebrationText}>Bewust bezig met drankjes & voeding</Text>
              <Text style={styles.celebrationText}>Goed bezig!</Text>
            </View>

            {/* Animated Mimi with bounce effect */}
            <Animated.View
              style={[
                styles.successMimiContainer,
                {
                  transform: [
                    {
                      scale: mimiScale.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={require('../../assets/Mimi_karakters/2_mimi_happy_1.png')} style={styles.successMimi} />
            </Animated.View>

            {/* Zwarte title en subtekst - onder Mimi */}
            <Text style={styles.successTitle}>Planning opgeslagen!</Text>
            <Text style={styles.successSubtitle}>Vind hem terug op je homescreen</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF4',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 46,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#F49B9B',
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    color: '#4B3B36',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 24,
    color: '#8E8B88',
  },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 0,
      paddingBottom: 24,
    },
  section: {
    marginBottom: 32,
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
  mainQuestion: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    color: '#4B3B36',
    marginBottom: 16,
  },
  instructionText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 26, // 165% of 16px
    color: '#A1A4B2',
    borderWidth: 0.15,
    borderColor: '#EBEAEC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  daySelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F49B9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#F49B9B',
    borderColor: '#F49B9B',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F49B9B',
    fontFamily: 'Poppins',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  timeSelection: {
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: '#4B3B36',
    fontFamily: 'Poppins',
    fontWeight: '300',
    lineHeight: 21,
    textAlign: 'left',
    minWidth: 60,
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
  timePickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  selectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#F49B9B',
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  chipsRow: {
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F0FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 72,
  },
  chipSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F0FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: '#F49B9B',
    backgroundColor: '#FDF2F2',
  },
  chipTopText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#7A6C66',
  },
  chipTopTextSelected: {
    color: '#4B3B36',
    fontWeight: '600',
  },
  chipBottomText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#4B3B36',
  },
  chipBottomTextSelected: {
    color: '#F49B9B',
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '50%',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B3C33',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  timePicker: {
    height: 200,
    marginBottom: 20,
  },
  timePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  timePickerCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E6',
  },
  timePickerCancelText: {
    fontSize: 16,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  timePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#F49B9B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FDE8E4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F49B9B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3C33',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  infoText: {
    fontSize: 14,
    color: '#7C6D63',
    lineHeight: 20,
    fontFamily: 'Poppins',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 20,
  },
  saveButton: {
    backgroundColor: '#F49B9B',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
  successSplash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFCF4',
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 3,
    opacity: 0.9,
  },
  successTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  celebrationTextContainer: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  celebrationText: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 19,
    lineHeight: 26,
    color: '#E8797A',
    textAlign: 'center',
    textShadowColor: 'rgba(232, 121, 122, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  successMimiContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMimi: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  successTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 26,
    color: '#4B3B36',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 15,
    color: '#7A6C66',
    textAlign: 'center',
  },
});
