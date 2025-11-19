import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { TimelineIcon, SafeIcon, WarningIcon } from './icons/PlanningIcons';

interface VisuelePlanningTimelineProps {
  startTime: Date;
  drinks: PlannedDrink[];
  feeds: FeedPrediction[];
  safeFeedTime: Date;
}

interface PlannedDrink {
  id: string;
  type: string;
  time: Date;
  amount: number;
}

interface FeedPrediction {
  time: Date;
  amount: number;
  confidence: number;
  type: 'predicted' | 'manual';
}

const { width } = Dimensions.get('window');

const VisuelePlanningTimeline: React.FC<VisuelePlanningTimelineProps> = ({
  startTime,
  drinks,
  feeds,
  safeFeedTime
}) => {
  const getTimelineHours = () => {
    const hours = [];
    const startHour = Math.max(16, startTime.getHours() - 2);
    const endHour = Math.min(24, startTime.getHours() + 8);
    
    for (let i = startHour; i <= endHour; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getEventPosition = (eventTime: Date, timelineStart: number) => {
    const eventHour = eventTime.getHours() + eventTime.getMinutes() / 60;
    const timelineEnd = timelineStart + 8;
    return Math.max(0, Math.min(100, ((eventHour - timelineStart) / (timelineEnd - timelineStart)) * 100));
  };

  const getEventStatus = (eventTime: Date) => {
    if (eventTime >= safeFeedTime) return 'safe';
    if (eventTime >= new Date(safeFeedTime.getTime() - 30 * 60 * 1000)) return 'warning';
    return 'danger';
  };

  const timelineHours = getTimelineHours();
  const timelineStart = timelineHours[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TimelineIcon size={20} color="#F49B9B" />
        <Text style={styles.title}>Planning overzicht</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
        <View style={styles.timelineContainer}>
          {/* Time labels */}
          <View style={styles.timeLabels}>
            {timelineHours.map((hour) => (
              <Text key={hour} style={styles.timeLabel}>
                {hour}:00
              </Text>
            ))}
          </View>
          
          {/* Timeline track */}
          <View style={styles.timelineTrack}>
            {/* Current time indicator */}
            <View style={[styles.currentTimeLine, { left: '50%' }]} />
            
            {/* Feed events */}
            {feeds.map((feed, index) => {
              const status = getEventStatus(feed.time);
              return (
                <View
                  key={`feed-${index}`}
                  style={[
                    styles.feedEvent,
                    styles[`${status}Event`],
                    {
                      left: `${getEventPosition(feed.time, timelineStart)}%`,
                    }
                  ]}
                >
                  <Text style={styles.eventIcon}>👶</Text>
                  <Text style={styles.eventTime}>
                    {feed.time.toLocaleTimeString('nl-NL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                  <Text style={styles.eventAmount}>{feed.amount}ml</Text>
                </View>
              );
            })}
            
            {/* Drink events */}
            {drinks.map((drink, index) => (
              <View
                key={`drink-${index}`}
                style={[
                  styles.drinkEvent,
                  {
                    left: `${getEventPosition(drink.time, timelineStart)}%`,
                  }
                ]}
              >
                <Text style={styles.eventIcon}>
                  {drink.type === 'WINE' ? '🍷' : 
                   drink.type === 'BEER' ? '🍺' : 
                   drink.type === 'COCKTAIL' ? '🍸' : '🥃'}
                </Text>
                <Text style={styles.eventTime}>
                  {drink.time.toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
                <Text style={styles.eventAmount}>{drink.amount}x</Text>
              </View>
            ))}
            
            {/* Safe feed line */}
            <View
              style={[
                styles.safeFeedLine,
                {
                  left: `${getEventPosition(safeFeedTime, timelineStart)}%`,
                }
              ]}
            >
              <SafeIcon size={16} color="#4CAF50" />
              <Text style={styles.safeFeedLabel}>Veilig voeden</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Veilig voeden</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Nipt veilig</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Niet veilig</Text>
        </View>
      </View>

      {/* Status summary */}
      <View style={styles.statusSummary}>
        <Text style={styles.statusTitle}>Planning status</Text>
        <View style={styles.statusItem}>
          <SafeIcon size={16} color="#4CAF50" />
          <Text style={styles.statusText}>
            Veilig voeden vanaf: {safeFeedTime.toLocaleTimeString('nl-NL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {feeds.filter(feed => getEventStatus(feed.time) === 'danger').length} voedingen tijdens afbraak
          </Text>
        </View>
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
  timelineScroll: {
    marginBottom: 16,
  },
  timelineContainer: {
    width: width * 1.5,
    minHeight: 120,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
  },
  timelineTrack: {
    height: 60,
    backgroundColor: '#F5F5F9',
    borderRadius: 8,
    position: 'relative',
    marginBottom: 8,
  },
  currentTimeLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#F49B9B',
    zIndex: 10,
  },
  feedEvent: {
    position: 'absolute',
    top: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  drinkEvent: {
    position: 'absolute',
    top: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  safeEvent: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 4,
  },
  warningEvent: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 4,
  },
  dangerEvent: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 4,
  },
  eventIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 10,
    color: '#3F414E',
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  eventAmount: {
    fontSize: 9,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
  },
  safeFeedLine: {
    position: 'absolute',
    top: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  safeFeedLabel: {
    fontSize: 10,
    color: '#4CAF50',
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#A1A4B2',
    fontFamily: 'Poppins',
  },
  statusSummary: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F9',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F414E',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#A1A4B2',
    marginLeft: 8,
    fontFamily: 'Poppins',
  },
});

export default VisuelePlanningTimeline;
