// components/DrinkLogTable.tsx - Drink log table with progress bars
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrinkEntry } from '../types/drinks';
import { DrinkType } from '../types/drinks';
import { drinkProgress, Profile } from '../lib/alcohol';
import Svg, { Path } from 'react-native-svg';

// Store refs for all swipeable items
const swipeableRefs = new Map<string, Swipeable | null>();

const SWIPE_HINT_KEY = 'mmb:swipe_hint_shown';

interface DrinkLogTableProps {
  entries: DrinkEntry[];
  drinkTypes: Record<string, DrinkType>;
  profile: Profile;
  onDelete?: (entryId: string) => void;
}

// Trash icon component
const TrashIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DrinkLogTable: React.FC<DrinkLogTableProps> = ({
  entries,
  drinkTypes,
  profile,
  onDelete
}) => {
  const now = Date.now();
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const swipeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check if we should show the swipe hint
    const checkSwipeHint = async () => {
      if (entries.length > 0 && onDelete) {
        try {
          const hintShown = await AsyncStorage.getItem(SWIPE_HINT_KEY);
          if (!hintShown) {
            setShowSwipeHint(true);
            // Start animations
            Animated.parallel([
              Animated.timing(fadeAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.loop(
                Animated.sequence([
                  Animated.timing(swipeAnimation, {
                    toValue: -60,
                    duration: 800,
                    useNativeDriver: true,
                  }),
                  Animated.timing(swipeAnimation, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                  }),
                  Animated.delay(500),
                ])
              ),
            ]).start();
          }
        } catch (e) {
          // Ignore error
        }
      }
    };

    checkSwipeHint();
  }, [entries.length, onDelete]);

  const dismissSwipeHint = async () => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSwipeHint(false);
    });
    try {
      await AsyncStorage.setItem(SWIPE_HINT_KEY, 'true');
    } catch (e) {
      // Ignore error
    }
  };

  const renderRightActions = (entryId: string, progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const translateX = dragX.interpolate({
      inputRange: [-60, 0],
      outputRange: [0, 60],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeDeleteContainer}>
        <Animated.View style={[styles.deleteAction, { transform: [{ translateX }] }]}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              // Close the swipeable first
              const swipeable = swipeableRefs.get(entryId);
              swipeable?.close();
              // Then delete after animation
              setTimeout(() => onDelete?.(entryId), 200);
            }}
          >
            <TrashIcon />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Auto-close swipe after showing briefly
  const handleSwipeableOpen = (entryId: string) => {
    // Auto-close after 1.5 seconds
    setTimeout(() => {
      const swipeable = swipeableRefs.get(entryId);
      swipeable?.close();
    }, 1500);
  };

  return (
    <View style={styles.table}>
      {/* Swipe hint overlay */}
      {showSwipeHint && (
        <Animated.View style={[styles.swipeHintOverlay, { opacity: fadeAnimation }]}>
          <View style={styles.swipeHintContainer}>
            <Animated.View style={[styles.swipeHintCard, { transform: [{ translateX: swipeAnimation }] }]}>
              <View style={styles.swipeHintRow}>
                <Text style={styles.swipeHintIcon}>👈</Text>
                <Text style={styles.swipeHintText}>Swipe naar links om te verwijderen</Text>
              </View>
            </Animated.View>
            <TouchableOpacity style={styles.swipeHintButton} onPress={dismissSwipeHint}>
              <Text style={styles.swipeHintButtonText}>Begrepen</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nog geen drankjes gelogd</Text>
        </View>
      ) : (
        entries.map((entry, index) => {
          const type = drinkTypes[entry.typeId];
          const progress = drinkProgress(entry, profile, now);
          const IconComponent = type.icon;
          const isLast = index === entries.length - 1;

          const rowContent = (
            <View style={[styles.row, isLast && styles.rowLast]}>
              <View style={styles.iconCell}>
                <IconComponent size={24} />
              </View>
              <View style={styles.nameCell}>
                <Text style={styles.cellName}>{type.label}</Text>
              </View>
              <View style={styles.qtyCell}>
                <Text style={styles.cellQty}>{entry.glasses}×</Text>
              </View>
              <View style={styles.timeCell}>
                <Text style={styles.cellTime}>
                  {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.progressCell}>
                <View style={styles.progressWrap}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            </View>
          );

          if (onDelete) {
            return (
              <Swipeable
                key={entry.id}
                ref={(ref) => swipeableRefs.set(entry.id, ref)}
                renderRightActions={(progress, dragX) => renderRightActions(entry.id, progress, dragX)}
                overshootRight={false}
                rightThreshold={30}
                friction={2}
                onSwipeableOpen={() => handleSwipeableOpen(entry.id)}
              >
                {rowContent}
              </Swipeable>
            );
          }

          return <View key={entry.id}>{rowContent}</View>;
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#E88F8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#8A7A78',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F4D3D1',
    backgroundColor: '#FFFFFF',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconCell: {
    width: 32,
    alignItems: 'center',
  },
  nameCell: {
    flex: 1,
    marginLeft: 12,
  },
  cellName: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#3D2F2E',
  },
  qtyCell: {
    width: 40,
    alignItems: 'center',
  },
  cellQty: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#6A5856',
  },
  timeCell: {
    width: 50,
    alignItems: 'center',
  },
  cellTime: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#8A7A78',
  },
  progressCell: {
    width: 60,
    marginLeft: 8,
  },
  progressWrap: {
    height: 4,
    backgroundColor: '#F4D3D1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E88F8A',
    borderRadius: 2,
  },
  actionCell: {
    width: 24,
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#D97671',
    lineHeight: 20,
  },
  swipeDeleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 60,
  },
  deleteAction: {
    backgroundColor: '#F49B9B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  swipeHintContainer: {
    alignItems: 'center',
    gap: 20,
  },
  swipeHintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  swipeHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swipeHintIcon: {
    fontSize: 32,
  },
  swipeHintText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3B36',
    maxWidth: 200,
  },
  swipeHintButton: {
    backgroundColor: '#F49B9B',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  swipeHintButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
