import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView, SafeAreaView, Animated } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { useStore } from "../../src/state/store";
import { MimiFloatField } from "../../src/components/MimiFloatField";
import { CountdownCard } from "../../src/components/CountdownCard";
import { DrinkLogTable } from "../../src/components/DrinkLogTable";
import { TipCarousel } from "../../src/components/TipCarousel";
import { FeedbackWidget } from "../../src/components/FeedbackWidget";
import { drinkTypes } from "../../src/data/drinkTypes";
import { countdownMs } from "../../src/lib/alcohol";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

// Inline SVG icons in MMB pink
const WineIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M8 2h8v3l2 2v3H6V7l2-2V2z" fill="#F49B9B"/>
    <Path d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

const BottleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M10 2h4v3l2 2v3H8V7l2-2V2z" fill="#F49B9B"/>
    <Path d="M8 10h8v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

const PlanIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
    <Path d="M9 14l2 2 4-4" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

// PNG-based clock icon component for planning card
const StraksClockIcon = () => (
  <Image
    source={require('../../assets/MMB_other/clock_13240955.png')}
    style={{ width: 24, height: 24 }}
    resizeMode="contain"
  />
);

const ClockIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

export default function Home() {
  const router = useRouter();
  const { settings, getCurrentSession, getProfile, dispatchDrinkAction } = useStore();
  const [hasActiveDrink, setHasActiveDrink] = useState(false);
  const [hasPlannedDrink, setHasPlannedDrink] = useState(false);
  const [plannedSummary, setPlannedSummary] = useState<null | { plannedDrinks: any[]; selectedDate: string; startTime: string; safeFeedTime?: string | null }>(null);
  const [hasDrinksToday, setHasDrinksToday] = useState(false);
  const [now, setNow] = useState(Date.now());

  // ZZZ Animation refs
  const zzz1Anim = useRef(new Animated.Value(0)).current;
  const zzz2Anim = useRef(new Animated.Value(0)).current;
  const zzz3Anim = useRef(new Animated.Value(0)).current;

  // Check for active sessions and update time
  useEffect(() => {
    const checkActiveSessions = () => {
      const currentSession = getCurrentSession();
      const hasEntries = currentSession && currentSession.entries.length > 0;

      setHasDrinksToday(hasEntries);
      setHasActiveDrink(hasEntries);
      setNow(Date.now());
    };

    checkActiveSessions();

    // Update every second
    const interval = setInterval(checkActiveSessions, 1000);

    return () => clearInterval(interval);
  }, [getCurrentSession]);

  // Load planned schedule for summary card whenever screen focuses
  const loadPlanning = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('mmb:planned_schedule');
      if (raw) {
        const parsed = JSON.parse(raw);
        setPlannedSummary(parsed);
        setHasPlannedDrink((parsed.plannedDrinks || []).length > 0);
      } else {
        setPlannedSummary(null);
        setHasPlannedDrink(false);
      }
    } catch (e) {
      setPlannedSummary(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlanning();
    }, [loadPlanning])
  );

  // ZZZ Animation effect
  useEffect(() => {
    if (!hasDrinksToday) {
      // Start ZZZ animation when Mimi is sleeping
      const createZzzAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 1120,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 1120,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const zzz1 = createZzzAnimation(zzz1Anim, 0);
      const zzz2 = createZzzAnimation(zzz2Anim, 200);
      const zzz3 = createZzzAnimation(zzz3Anim, 400);

      zzz1.start();
      zzz2.start();
      zzz3.start();

      return () => {
        zzz1.stop();
        zzz2.stop();
        zzz3.stop();
      };
    } else {
      // Reset animations when Mimi is awake
      zzz1Anim.setValue(0);
      zzz2Anim.setValue(0);
      zzz3Anim.setValue(0);
    }
  }, [hasDrinksToday]);

  // Get current session and profile
  const currentSession = getCurrentSession();
  const profile = getProfile();

  // Dynamische begroeting op basis van tijdstip
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return 'Goedemorgen';
    } else if (hour >= 12 && hour < 18) {
      return 'Goedemiddag';
    } else {
      return 'Goedeavond';
    }
  };

  // Determine which Mimi to show based on countdown timer (same logic as onboarding)
  const getMimiImage = () => {
    // Als er een session bestaat (ook al zijn alle drankjes verwijderd), gebruik countdown logica
    // Dit geeft gebruikers vertrouwen dat de app hun activiteit bijhoudt
    if (currentSession) {
      // Calculate countdown in minutes
      const ms = countdownMs(currentSession.entries || [], profile, now);
      const minutesRemaining = Math.ceil(ms / (1000 * 60));

      // Mimi state based on countdown
      if (minutesRemaining === 0) {
        // VEILIG - Milkbar open! (ook als alle drankjes zijn verwijderd)
        return require('../../assets/Mimi_karakters/Milkbar_open_1.png');
      } else if (minutesRemaining < 60) {
        // BIJNA - Almost open
        return require('../../assets/Mimi_karakters/2_mimi_happy_2.png');
      } else if (minutesRemaining < 120) {
        // NOG NIET - Not yet open
        return require('../../assets/Mimi_karakters/4_nogniet_2.png');
      } else {
        // GESLOTEN - Closed, still waiting
        return require('../../assets/Mimi_karakters/7_Closed_mimi_png.png');
      }
    }

    // Geen session vandaag = sleeping Mimi (echt nog niets gelogd)
    return require('../../assets/Mimi_karakters/sleeping_mimi.png');
  };

  const mainChoices = [
    {
      id: 1,
      title: "Ik ga nu drinken",
      subtitle: "Log je drankje en zie direct wanneer je weer veilig kunt voeden.",
      cta: "Drankje loggen",
      icon: <WineIcon />,
      color: "#FDE8E4",
      onPress: () => router.push('/drinks')
    },
    {
      id: 2,
      title: "Ik wil straks drinken",
      subtitle: "Plan je voeding en ontdek hoe je veilig kunt genieten van een drankje.",
      cta: "Voeding plannen",
      icon: <StraksClockIcon />,
      color: "#F0F8F0",
      onPress: () => router.push('/planning/smart')
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: "Voeding toevoegen",
      icon: <BottleIcon />,
      onPress: () => router.push('/feedings')
    },
    {
      id: 2,
      title: "Melkvoorraad",
      icon: <ClockIcon />,
      onPress: () => router.push('/milk-storage')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {settings.motherName === 'prefer_not_to_share' ? 'mama' : settings.motherName || 'mama'}
          </Text>
          <Text style={styles.subGreeting}>
            {hasDrinksToday
              ? "Mama geniet, baby wacht geduldig"
              : "Nog geen activiteiten vandaag."
            }
          </Text>
        </View>

        {/* Combined Mimi and Status Wrapper */}
        <View style={styles.combinedWrapper}>
          {/* Mimi Character - Centered with Float Field */}
          <View style={styles.mimiWrapper}>
            {/* Background ellipses with proper layering */}
            <View style={styles.ellipseBackground}>
              
              
              {/* Ellipse_1 - Front layer (darker pink) */}
              <View style={styles.ellipse1Container}>
                <Svg width={523} height={127} viewBox="0 0 523 127" style={styles.ellipse1}>
                  <Path d="M522.661 50.6944C478.517 100.984 437.089 125.854 270.285 126.086C103.482 126.319 28.4221 99.7017 0.159275 47.233C42.1949 12.9192 126.986 8.11337 267.965 0.492844C439.758 -3.90171 527.208 45.5142 522.661 50.6944Z" fill="#FA9795"/>
                </Svg>
              </View>
              
            </View>
            
            {/* Background spheres layer */}
            <MimiFloatField width={width - 48} height={height * 0.23} reducedMotion={false} />
            {/* Mimi character layer */}
            <View style={styles.mimiContainer}>
              <Image 
                source={getMimiImage()} 
                style={styles.mimiImage} 
                resizeMode="contain" 
              />
              
              {/* ZZZ Animation - only show when sleeping */}
              {!hasDrinksToday && (
                <View style={styles.zzzContainer}>
                  <Animated.View style={[
                    styles.zzz,
                    {
                      opacity: zzz1Anim,
                      transform: [
                        { translateY: zzz1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10]
                        })}
                      ]
                    }
                  ]}>
                    <Text style={styles.zzzText}>Z</Text>
                  </Animated.View>
                  
                  <Animated.View style={[
                    styles.zzz,
                    {
                      opacity: zzz2Anim,
                      transform: [
                        { translateY: zzz2Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -15]
                        })}
                      ]
                    }
                  ]}>
                    <Text style={styles.zzzText}>Z</Text>
                  </Animated.View>
                  
                  <Animated.View style={[
                    styles.zzz,
                    {
                      opacity: zzz3Anim,
                      transform: [
                        { translateY: zzz3Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20]
                        })}
                      ]
                    }
                  ]}>
                    <Text style={styles.zzzText}>Z</Text>
                  </Animated.View>
                </View>
              )}
            </View>
            
          </View>

          {/* Countdown Card */}
          <CountdownCard 
            session={currentSession} 
            drinkTypes={drinkTypes} 
            profile={profile} 
          />
        </View>



        {/* Main Choices */}
        <View style={styles.choicesContainer}>
          {/* Tip van de dag Carousel */}
          <View style={styles.tipCarouselWrapper}>
            <TipCarousel />
          </View>

          {/* Planned summary card */}
          {plannedSummary && (
            <View style={styles.plannedCard}>
              <Text style={styles.plannedTitle}>Volgend gepland drankje</Text>
              <View style={styles.plannedRow}>
                <Text style={styles.plannedLabel}>Wanneer:</Text>
                <Text style={styles.plannedValue}>{new Date(plannedSummary.selectedDate).toLocaleDateString('nl-NL')}</Text>
              </View>
              <View style={styles.plannedRow}>
                <Text style={styles.plannedLabel}>Starttijd:</Text>
                <Text style={styles.plannedValue}>{new Date(plannedSummary.startTime).toLocaleTimeString('nl-NL', {hour:'2-digit', minute:'2-digit'})}</Text>
              </View>
              <View style={styles.plannedRow}>
                <Text style={styles.plannedLabel}>Aantal:</Text>
                <Text style={styles.plannedValue}>{plannedSummary.plannedDrinks.length} drankje(n)</Text>
              </View>
              {plannedSummary.safeFeedTime && (
                <View style={styles.plannedRow}>
                  <Text style={styles.plannedLabel}>Veilig voeden:</Text>
                  <Text style={styles.plannedValue}>{new Date(plannedSummary.safeFeedTime).toLocaleTimeString('nl-NL', {hour:'2-digit', minute:'2-digit'})}</Text>
                </View>
              )}
              <Text style={styles.plannedDisclaimer}>Indicatie, geen medisch advies.</Text>
              <View style={styles.plannedActions}>
                <TouchableOpacity style={styles.plannedEdit} onPress={() => router.push('/planning/smart')}>
                  <Text style={styles.plannedEditText}>Aanpassen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.plannedDelete}
                  onPress={async () => {
                    try { await AsyncStorage.removeItem('mmb:planned_schedule'); } catch {}
                    loadPlanning();
                  }}
                >
                  <Text style={styles.plannedDeleteText}>Verwijderen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <TouchableOpacity 
            style={styles.drinkCard}
            onPress={mainChoices[0].onPress}
          >
            {/* Left section with wine icon */}
            <View style={styles.drinkCardLeft}>
              <Image 
                source={require('../../assets/MMB_other/Wine_icon.png')} 
                style={styles.drinkCardIcon} 
                resizeMode="contain" 
              />
            </View>
            
            {/* Right section with text and button */}
            <View style={styles.drinkCardRight}>
              <Text style={styles.drinkCardTitle}>Ik ga nu drinken</Text>
              <Text style={styles.drinkCardSubtitle}>
                Log je drankje en zie wanneer je weer veilig kunt voeden
              </Text>
              <TouchableOpacity style={styles.drinkCardButton} onPress={mainChoices[0].onPress}>
                <Text style={styles.drinkCardButtonText}>Drankje loggen</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Drink Log Table */}
          {currentSession && currentSession.entries.length > 0 && (
            <DrinkLogTable 
              entries={currentSession.entries} 
              drinkTypes={drinkTypes} 
              profile={profile}
              onDelete={(entryId) => dispatchDrinkAction({ type: 'DELETE_ENTRY', payload: { id: entryId } })}
            />
          )}

          {/* Section: Plannen */}
          <TouchableOpacity 
            style={styles.planCard}
            onPress={mainChoices[1].onPress}
          >
            {/* Left Section - Icon */}
            <View style={styles.planCardLeft}>
              <Image 
                source={require('../../assets/MMB_other/clock_13240955.png')} 
                style={styles.planIcon}
                resizeMode="contain"
              />
            </View>
            
            {/* Right Section - Text and Button */}
            <View style={styles.planCardRight}>
              <Text style={styles.planTitle}>{mainChoices[1].title}</Text>
              <Text style={styles.planSubtitle}>Plan je voeding en voel je zeker om veilig te kunnen genieten van een drankje.</Text>
              <TouchableOpacity style={styles.planButton} onPress={mainChoices[1].onPress}>
              <Text style={styles.planButtonText}>Drankje plannen</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Compact planningsoverzicht onder 'Ik wil straks drinken' */}
          {plannedSummary && (
            <View style={styles.compactPlanCard}>
              <Text style={styles.compactTitle}>Planningsoverzicht</Text>
              <View style={styles.compactRow}>
                <Text style={styles.compactLabel}>Wanneer</Text>
                <Text style={styles.compactValue}>{new Date(plannedSummary.selectedDate).toLocaleDateString('nl-NL')}</Text>
              </View>
              <View style={styles.compactRow}>
                <Text style={styles.compactLabel}>Starttijd</Text>
                <Text style={styles.compactValue}>{new Date(plannedSummary.startTime).toLocaleTimeString('nl-NL', {hour:'2-digit', minute:'2-digit'})}</Text>
              </View>
              <View style={styles.compactRow}>
                <Text style={styles.compactLabel}>Drankjes</Text>
                <Text style={styles.compactValue}>{plannedSummary.plannedDrinks.length}</Text>
              </View>
              {plannedSummary.safeFeedTime && (
                <View style={styles.compactRow}>
                  <Text style={styles.compactLabel}>Veilig voeden</Text>
                  <Text style={styles.compactValue}>{new Date(plannedSummary.safeFeedTime).toLocaleTimeString('nl-NL', {hour:'2-digit', minute:'2-digit'})}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions - Hidden until activity */}
        {/* <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Snelle acties</Text>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <View style={styles.quickActionIcon}>
                  {action.icon}
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}


        {/* Feedback Widget */}
        <FeedbackWidget />

        {/* Microcopy */}
        <View style={styles.microcopyContainer}>
          <Text style={styles.microcopyText}>
            We helpen plannen, jij beslist. Je data blijft van jou.
          </Text>
        </View>
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    color: '#4B3B36',
    marginBottom: 4,
  },
  subGreeting: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 24,
    color: '#B3AFAF',
  },
  combinedWrapper: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#FA9795',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mimiWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.23,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#FEDFE0',
  },
  ellipseBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipse1Container: {
    position: 'absolute',
    bottom: -60,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center',
  },
  ellipse1: {
    width: '100%',
    height: '100%',
  },
  mimiContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  mimiImage: {
    width: 120,
    height: 140,
  },
  zzzContainer: {
    position: 'absolute',
    top: 50,
    right: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  zzz: {
    marginLeft: 8,
  },
  zzzText: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 24,
    color: '#F49B9B',
    textShadowColor: 'rgba(244, 155, 155, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 3,
  },
  statusCard: {
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingTop: 0,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: 'relative',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  statusContent: {
    marginBottom: 0,
  },
  statusTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  countdownTimer: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 2,
  },
  choicesContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  tipCarouselWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  choiceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0D5D1',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  wineIcon: {
    width: 24,
    height: 24,
  },
  drinkCard: {
    width: '100%',
    height: 142,
    backgroundColor: '#FFF2F4',
    borderRadius: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  drinkCardLeft: {
    width: 100,
    height: 142,
    backgroundColor: '#F49B9B',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drinkCardIcon: {
    width: 74,
    height: 80,
    transform: [{ rotate: '-11.36deg' }],
  },
  drinkCardRight: {
    flex: 1,
    backgroundColor: '#FFF2F4',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  drinkCardTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 19,
    color: '#4B3B36',
    marginBottom: 8,
  },
  drinkCardSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.05,
    color: '#4B3B36',
    marginBottom: 16,
  },
  drinkCardButton: {
    backgroundColor: '#F49B9B',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  drinkCardButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 13,
    letterSpacing: 0.05,
    color: '#FFFFFF',
  },
  choiceText: {
    flex: 1,
  },
  choiceTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 26,
    color: '#4B3B36',
    marginBottom: 4,
  },
  choiceSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 13,
    lineHeight: 18,
    color: '#7A6C66',
  },
  choiceCTA: {
    backgroundColor: '#F49B9B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  choiceCTAText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
    color: '#4B3B36',
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: '#7A6C66',
    marginBottom: 8,
    marginLeft: 4,
  },
  tipContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F49B9B',
  },
  tipText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    color: '#7A6C66',
  },
  tipBold: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#4B3B36',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#4B3B36',
    textAlign: 'center',
  },
  microcopyContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    alignItems: 'center',
  },
  plannedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0D5D1',
  },
  plannedTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 18,
    color: '#F49B9B',
    marginBottom: 8,
  },
  plannedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  plannedLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#7A6C66',
  },
  plannedValue: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#4B3B36',
  },
  plannedDisclaimer: {
    marginTop: 10,
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 11,
    color: '#A8A5A2',
  },
  plannedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  plannedEdit: {
    flex: 1,
    marginRight: 8,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFECEF',
    borderWidth: 1,
    borderColor: '#F49B9B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannedEditText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#F49B9B',
  },
  plannedDelete: {
    flex: 1,
    marginLeft: 8,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannedDeleteText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#7A6C66',
  },
  compactPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F0D5D1',
  },
  compactTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 16,
    color: '#4B3B36',
    marginBottom: 6,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  compactLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#7A6C66',
    fontSize: 12,
  },
  compactValue: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#4B3B36',
    fontSize: 12,
  },
  // Plan Card Styles
  planCard: {
    width: '100%',
    height: 142,
    backgroundColor: '#FFF5F6',
    borderRadius: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  planCardLeft: {
    width: 100,
    height: 142,
    backgroundColor: '#FAD6D6',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planIcon: {
    width: 60,
    height: 60,
  },
  planCardRight: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  planTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 19,
    color: '#4B3B36',
    marginBottom: 8,
  },
  planSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 11,
    letterSpacing: 0.05,
    color: '#4B3B36',
    marginBottom: 16,
  },
  planButton: {
    width: 137,
    height: 35,
    backgroundColor: '#F49B9B',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 13,
    textAlign: 'center',
    letterSpacing: 0.05,
    color: '#FFFFFF',
  },
  microcopyText: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    color: '#A8A5A2',
    textAlign: 'center',
  },
});
