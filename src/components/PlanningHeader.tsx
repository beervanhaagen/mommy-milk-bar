import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PlanningHeaderProps {
  title?: string;
  subtitle?: string;
}

export const PlanningHeader: React.FC<PlanningHeaderProps> = ({ 
  title = "Drankje plannen",
  subtitle = "Even samen plannen, dan kun jij straks echt ontspannen 💕"
}) => {
  return (
    <LinearGradient
      colors={['#E8F0FF', '#FFFFFF']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.mimiIcon}>
          <Image 
            source={require('../../assets/Mimi_karakters/1_enthousiast_1.png')}
            style={styles.mimiImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 24,
    color: '#4B3C33',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    color: '#7C6D63',
    lineHeight: 22,
  },
  mimiIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDE8E4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F49B9B',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mimiImage: {
    width: 40,
    height: 40,
  },
});
