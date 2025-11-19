import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlannerCardProps {
  title: string;
  children: React.ReactNode;
  style?: any;
}

export const PlannerCard: React.FC<PlannerCardProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B3C33',
    marginBottom: 16,
  },
});
