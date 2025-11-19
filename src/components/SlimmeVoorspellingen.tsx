import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import Svg, { Circle, Path, Rect, SvgUri } from 'react-native-svg';
import { PlannedDrink } from './SlimmeDrankjePlanner';
import { FeedPrediction } from './BabyRitmeTracker';
import { drinkTypes } from '../data/drinkTypes';

interface SlimmeVoorspellingenProps {
  plannedDrinks: PlannedDrink[];
  predictedFeeds: FeedPrediction[];
  startTime: Date;
  lastFeedTime?: Date;
  strategy?: 'minimal' | 'conservative';
}

interface PlanningMoment {
  time: Date;
  type: 'drink' | 'feed' | 'pump' | 'safe';
  label: string;
  description: string;
  status: 'safe' | 'warning' | 'unsafe';
  drinkTypeId?: string;
}

// Icon components matching onboarding style with pink theme
const BabyIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} fill="#F49B9B" />
    <Path
      d="M12 13c-3.5 0-6 2-6 4v2h12v-2c0-2-2.5-4-6-4z"
      fill="#F49B9B"
    />
  </Svg>
);

const BottleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x={9} y={3} width={6} height={2} rx={1} fill="#F49B9B" />
    <Path
      d="M10 5h4v2c0 .5.5 1 1 1h0c.5 0 1 .5 1 1v10c0 1-1 2-2 2h-4c-1 0-2-1-2-2V9c0-.5.5-1 1-1h0c.5 0 1-.5 1-1V5z"
      fill="#F49B9B"
    />
    <Circle cx={12} cy={14} r={1.5} fill="#FFFFFF" opacity={0.8} />
  </Svg>
);

const WineIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2h8l-1 8c0 2.2-1.8 4-4 4s-4-1.8-4-4L8 2z"
      fill="#F49B9B"
    />
    <Rect x={11} y={14} width={2} height={6} fill="#F49B9B" />
    <Rect x={8} y={20} width={8} height={1.5} rx={0.75} fill="#F49B9B" />
  </Svg>
);

const BeerIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 8h10v12H6z"
      fill="#F49B9B"
    />
    <Path
      d="M8 4h6c1 0 2 1 2 2v2H6V6c0-1 1-2 2-2z"
      fill="#F49B9B"
    />
    <Rect x={16} y={11} width={2} height={6} fill="#F49B9B" />
  </Svg>
);

const CocktailIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 3l7 10v8M19 3l-7 10v8"
      stroke="#F49B9B"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Rect x={10} y={21} width={4} height={1} fill="#F49B9B" />
  </Svg>
);

const PumpIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={10} r={4} fill="#F49B9B" />
    <Path
      d="M12 14c-2 0-3.5 1-3.5 2.5V19h7v-2.5c0-1.5-1.5-2.5-3.5-2.5z"
      fill="#F49B9B"
    />
    <Path
      d="M15 8l3-3M16 10l2.5-2.5"
      stroke="#F49B9B"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const babyFaceSvgUri = Image.resolveAssetSource(require('../../assets/MMB_other/Babysface.svg')).uri;
const pumpSvgUri = Image.resolveAssetSource(require('../../assets/MMB_other/pump.svg')).uri;
const bottleSvgUri = Image.resolveAssetSource(require('../../assets/MMB_other/Baby Bottle.svg')).uri;
const safeSvgUri = Image.resolveAssetSource(require('../../assets/MMB_other/Approval_green.svg')).uri;

const CheckIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 12l2 2 4-4"
      stroke="#F49B9B"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={12} r={9} stroke="#F49B9B" strokeWidth={2} />
  </Svg>
);

const SlimmeVoorspellingen: React.FC<SlimmeVoorspellingenProps> = ({
  plannedDrinks,
  predictedFeeds,
  startTime,
  lastFeedTime,
  strategy: propStrategy = 'minimal',
}) => {
  const [planningMoments, setPlanningMoments] = useState<PlanningMoment[]>([]);
  const [strategy, setStrategy] = useState<'minimal' | 'conservative'>(propStrategy);
  const [safetyMarginMin, setSafetyMarginMin] = useState<number>(30);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Sync strategy from prop
  useEffect(() => {
    setStrategy(propStrategy);
  }, [propStrategy]);

  // Calculate safe feeding time based on drinks
  const calculateSafeFeedTime = useCallback((drinks: PlannedDrink[]) => {
    if (!drinks || drinks.length === 0) return null;

    const normalized = drinks
      .map(d => {
        const t = d.time instanceof Date ? d.time : new Date((d as any).time);
        return isNaN(t.getTime()) ? null : { ...d, time: t } as PlannedDrink & { time: Date };
      })
      .filter(Boolean) as Array<PlannedDrink & { time: Date }>;

    if (normalized.length === 0) return null;

    const lastDrink = normalized.reduce((latest, drink) =>
      drink.time.getTime() > latest.time.getTime() ? drink : latest
    );

    const totalStandardDrinks = normalized.reduce((total, drink) => {
      const drinkMultiplier = drink.type === 'wine' ? 1.2 :
        drink.type === 'beer' ? 0.8 :
          drink.type === 'cocktail' ? 1.5 : 1.0;
      const amount = typeof (drink as any).amount === 'number' ? (drink as any).amount : 1;
      return total + (amount * drinkMultiplier);
    }, 0);

    const clearanceHours = totalStandardDrinks * 2;
    const safeTime = new Date(lastDrink.time.getTime() + clearanceHours * 60 * 60 * 1000 + safetyMarginMin * 60 * 1000);

    return safeTime;
  }, [safetyMarginMin]);

  // Generate planning moments
  const generatePlanningMoments = useCallback(() => {
    const moments: PlanningMoment[] = [];
    const safeFeedTime = calculateSafeFeedTime(plannedDrinks);

    if (startTime) {
      const lastFeedBefore = lastFeedTime ? new Date(lastFeedTime) : new Date(startTime.getTime() - 60 * 60 * 1000);
      moments.push({
        time: lastFeedBefore,
        type: 'feed',
        label: 'Laatste voeding',
        description: 'Voed baby voor je begint',
        status: 'safe',
      });
    }

    const normalized = plannedDrinks
      .map(d => {
        const t = d.time instanceof Date ? d.time : new Date((d as any).time);
        return isNaN(t.getTime()) ? null : { ...d, time: t } as PlannedDrink & { time: Date };
      })
      .filter(Boolean) as Array<PlannedDrink & { time: Date }>;

    normalized.forEach((drink) => {
      moments.push({
        time: drink.time,
        type: 'drink',
        label: 'Drankje',
        description: `${drink.type === 'wine' ? 'Wijn' : drink.type === 'beer' ? 'Bier' : drink.type === 'cocktail' ? 'Cocktail' : 'Drankje'}`,
        status: 'unsafe',
        drinkTypeId: drink.type,
      });
    });

    const nearSafeThresholdMin = 90;
    const maxComfortHours = 5;

    const scheduleStrategicPumps = (lastEmpty: Date, safe?: Date) => {
      if (!safe) return;
      const gapToSafe = (safe.getTime() - lastEmpty.getTime()) / (1000 * 60 * 60);

      if (gapToSafe <= maxComfortHours) {
        return;
      }

      const latestPump = new Date(safe.getTime() - nearSafeThresholdMin * 60 * 1000);
      const gapFromLast = (latestPump.getTime() - lastEmpty.getTime()) / (1000 * 60 * 60);

      if (gapFromLast <= maxComfortHours) {
        moments.push({
          time: latestPump,
          type: 'pump',
          label: 'Kolven',
          description: 'Voor productiebehoud',
          status: 'warning',
        });
        return;
      }

      let current = lastEmpty;
      while ((safe.getTime() - current.getTime()) / (1000 * 60 * 60) > maxComfortHours) {
        const candidate = new Date(current.getTime() + maxComfortHours * 60 * 60 * 1000);
        const diffToSafeMin = Math.round((safe.getTime() - candidate.getTime()) / (1000 * 60));
        if (diffToSafeMin >= 0 && diffToSafeMin <= nearSafeThresholdMin) {
          const lastPump = new Date(safe.getTime() - nearSafeThresholdMin * 60 * 1000);
          if (lastPump.getTime() > current.getTime()) {
            moments.push({
              time: lastPump,
              type: 'pump',
              label: 'Kolven',
              description: 'Voor productiebehoud',
              status: 'warning',
            });
          }
          break;
        }
        moments.push({
          time: candidate,
          type: 'pump',
          label: 'Kolven',
          description: 'Voor productiebehoud',
          status: 'warning',
        });
        current = candidate;
      }
    };

    const scheduleConservativePumps = (from: Date, to: Date, safe?: Date) => {
      const intervalHours = 2.5;
      const intervalMs = intervalHours * 60 * 60 * 1000;
      let nextPump = new Date(from.getTime() + intervalMs);
      const nearSafeCutoff = safe ? new Date(safe.getTime() - nearSafeThresholdMin * 60 * 1000) : null;

      while (nextPump.getTime() < to.getTime()) {
        if (!nearSafeCutoff || nextPump.getTime() < nearSafeCutoff.getTime()) {
          moments.push({
            time: new Date(nextPump),
            type: 'pump',
            label: 'Kolven',
            description: 'Voor productiebehoud',
            status: 'warning',
          });
        }
        nextPump = new Date(nextPump.getTime() + intervalMs);
      }
    };

    const anchorLastFeedBefore = lastFeedTime ? new Date(lastFeedTime) : new Date(startTime.getTime() - 60 * 60 * 1000);
    let lastEmptyRef: Date = anchorLastFeedBefore || startTime;

    if (strategy === 'minimal') {
      scheduleStrategicPumps(lastEmptyRef, safeFeedTime || undefined);
    }

    const canFeedEarlier = (feedTime: Date, st: Date, lastFeed?: Date) => {
      const earlierTime = new Date(st.getTime() - 30 * 60 * 1000);
      if (lastFeed) {
        const gapFromLast = (earlierTime.getTime() - lastFeed.getTime()) / (1000 * 60 * 60);
        if (gapFromLast < 2) return false;
      }
      const gapToOriginal = (feedTime.getTime() - st.getTime()) / (1000 * 60 * 60);
      if (gapToOriginal < 0.5) return false;
      return true;
    };

    predictedFeeds.forEach((feed) => {
      const beforeSafe = safeFeedTime ? feed.time < safeFeedTime : true;

      if (beforeSafe) {
        if (canFeedEarlier(feed.time, startTime, lastFeedTime)) {
          const earlier = new Date(startTime.getTime() - 30 * 60 * 1000);
          moments.push({
            time: earlier,
            type: 'feed',
            label: 'Voed eerder',
            description: 'Voor je eerste drankje',
            status: 'safe',
          });
          if (strategy === 'conservative') {
            scheduleConservativePumps(lastEmptyRef, earlier, safeFeedTime || undefined);
          }
          lastEmptyRef = earlier;
        } else {
          moments.push({
            time: feed.time,
            type: 'feed',
            label: 'Flesje geven',
            description: 'Gebruik voorraad',
            status: 'safe',
          });

          if (strategy === 'conservative') {
            scheduleConservativePumps(lastEmptyRef, feed.time, safeFeedTime || undefined);
            const recentPumps = moments.filter(m =>
              m.type === 'pump' &&
              m.time.getTime() > lastEmptyRef.getTime() &&
              m.time.getTime() <= feed.time.getTime()
            );
            if (recentPumps.length > 0) {
              const lastPumpInSegment = recentPumps.reduce((latest, pump) =>
                pump.time.getTime() > latest.time.getTime() ? pump : latest
              );
              lastEmptyRef = lastPumpInSegment.time;
            }
          }
        }
      } else {
        moments.push({
          time: feed.time,
          type: 'feed',
          label: 'Baby voeding',
          description: 'Veilig om te voeden',
          status: 'safe',
        });
        lastEmptyRef = feed.time;
      }
    });

    if (strategy === 'conservative' && safeFeedTime && lastEmptyRef < safeFeedTime) {
      scheduleConservativePumps(lastEmptyRef, safeFeedTime, safeFeedTime);
    }

    if (safeFeedTime) {
      moments.push({
        time: safeFeedTime,
        type: 'safe',
        label: 'Veilig voeden',
        description: 'Alcohol volledig afgebroken',
        status: 'safe'
      });
    }

    moments.sort((a, b) => a.time.getTime() - b.time.getTime());
    setPlanningMoments(moments);
  }, [plannedDrinks, predictedFeeds, calculateSafeFeedTime, startTime, lastFeedTime, strategy]);

  useEffect(() => {
    generatePlanningMoments();
  }, [generatePlanningMoments, plannedDrinks, predictedFeeds, strategy, safetyMarginMin]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (moment: PlanningMoment) => {
    if (moment.type === 'drink') {
      const drinkType = moment.drinkTypeId ? drinkTypes[moment.drinkTypeId] : undefined;
      const IconComponent = drinkType?.icon;
      if (IconComponent) {
        return <IconComponent size={24} />;
      }
      return <WineIcon />;
    }

    // For feeds, differentiate between baby feeding and bottle feeding
    if (moment.type === 'feed') {
      if (moment.label.includes('Flesje')) {
        return <SvgUri width={24} height={24} uri={bottleSvgUri} />;
      }
      return <SvgUri width={24} height={24} uri={babyFaceSvgUri} />;
    }

    switch (moment.type) {
      case 'pump':
        return <SvgUri width={24} height={24} uri={pumpSvgUri} />;
      case 'safe':
        return <SvgUri width={24} height={24} uri={safeSvgUri} />;
      default:
        return <SvgUri width={24} height={24} uri={babyFaceSvgUri} />;
    }
  };

  const getIconBubbleColor = (moment: PlanningMoment) => {
    if (moment.type === 'drink') return '#FFF4F2';
    if (moment.type === 'safe') return '#E8F5E9';
    if (moment.type === 'pump') return '#FFF1F0';
    return '#FFF6F4';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planningsoverzicht</Text>
      <Text style={styles.subtitle}>Belangrijkste momenten van je avond</Text>

      {/* Strategy Buttons */}
      <View style={styles.strategyRow}>
        <TouchableOpacity
          style={[styles.strategyButton, strategy === 'minimal' && styles.strategyButtonActive]}
          onPress={() => setStrategy('minimal')}
        >
          <Text style={[styles.strategyText, strategy === 'minimal' && styles.strategyTextActive]}>Zo min mogelijk Kolven</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.strategyButton, strategy === 'conservative' && styles.strategyButtonActive]}
          onPress={() => setStrategy('conservative')}
        >
          <Text style={[styles.strategyText, strategy === 'conservative' && styles.strategyTextActive]}>Beste voor Productie</Text>
        </TouchableOpacity>
      </View>

      {planningMoments.length > 0 ? (
        <View style={styles.momentsList}>
          {planningMoments.map((moment, index) => {
            const isSafeMoment = moment.type === 'safe';
            return (
              <View
                key={index}
                style={[
                  styles.planningRow,
                ]}
              >
                <View style={[styles.planningItem, isSafeMoment && styles.safeRow]}>
                  <View style={styles.timeColumn}>
                    <Text style={[styles.itemTime, isSafeMoment && styles.safeTime]}>
                      {formatTime(moment.time)}
                    </Text>
                  </View>

                  <View style={styles.iconColumn}>
                    <View style={[styles.itemIconBubble, { backgroundColor: getIconBubbleColor(moment) }]}>
                      {getIcon(moment)}
                    </View>
                  </View>

                  <View style={styles.detailsColumn}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.itemLabel, isSafeMoment && styles.safeLabel]}>
                        {moment.label}
                      </Text>
                    </View>
                    <Text style={[styles.itemDetail, isSafeMoment && styles.safeDetail]}>
                      {moment.description}
                    </Text>

                    {isSafeMoment && (
                      <>
                        <View style={styles.safetyMarginButtons}>
                          <TouchableOpacity
                            style={[styles.marginButton, safetyMarginMin === 30 && styles.marginButtonActive]}
                            onPress={() => setSafetyMarginMin(30)}
                          >
                            <Text style={[styles.marginButtonText, safetyMarginMin === 30 && styles.marginButtonTextActive]}>
                              Standaard
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.marginButton, safetyMarginMin === 45 && styles.marginButtonActive]}
                            onPress={() => setSafetyMarginMin(45)}
                          >
                            <Text style={[styles.marginButtonText, safetyMarginMin === 45 && styles.marginButtonTextActive]}>
                              +15 min
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.marginButton, safetyMarginMin === 60 && styles.marginButtonActive]}
                            onPress={() => setSafetyMarginMin(60)}
                          >
                            <Text style={[styles.marginButtonText, safetyMarginMin === 60 && styles.marginButtonTextActive]}>
                              +30 min
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.disclaimerText}>Indicatie, geen medisch advies</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Voeg drankjes toe om je planning te zien
        </Text>
      )}

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContainer}>
            <Text style={styles.infoModalTitle}>Informatie</Text>
            <Text style={styles.infoModalText}>
              Indicatie, geen medisch advies
            </Text>
            <TouchableOpacity
              style={styles.infoModalButton}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.infoModalButtonText}>Begrepen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
    fontFamily: 'Quicksand',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8B88',
    marginBottom: 16,
    fontFamily: 'Poppins',
    fontStyle: 'italic',
  },
  strategyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  strategyButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  strategyButtonActive: {
    borderColor: '#F49B9B',
    backgroundColor: '#FFECEF',
  },
  strategyText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    color: '#7A6C66',
  },
  strategyTextActive: {
    color: '#F49B9B',
  },
  momentsList: {
    width: '100%',
  },
  planningRow: {
    width: '100%',
    marginBottom: 12,
    paddingVertical: 8,
  },
  safeRow: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  planningItem: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  timeColumn: {
    width: 60,
    paddingTop: 4,
  },
  itemTime: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#4B3B36',
  },
  safeTime: {
    color: '#6FCF97',
  },
  iconColumn: {
    width: 42,
    alignItems: 'center',
    marginRight: 12,
  },
  itemIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsColumn: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3B36',
  },
  safeLabel: {
    color: '#6FCF97',
  },
  infoIconButton: {
    marginLeft: 6,
  },
  itemDetail: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#7A6C66',
    lineHeight: 20,
  },
  safeDetail: {
    color: '#56B57D',
  },
  safetyMarginButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  marginButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6FCF97',
    backgroundColor: 'transparent',
  },
  marginButtonActive: {
    borderColor: '#6FCF97',
    backgroundColor: '#6FCF97',
  },
  marginButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 10,
    color: '#6FCF97',
  },
  marginButtonTextActive: {
    color: '#FFFFFF',
  },
  disclaimerText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: '#A1A4B2',
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8B88',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Poppins',
    marginTop: 20,
  },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  infoModalTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#4B3B36',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoModalText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#7A6C66',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  infoModalButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F49B9B',
    alignItems: 'center',
  },
  infoModalButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default SlimmeVoorspellingen;

