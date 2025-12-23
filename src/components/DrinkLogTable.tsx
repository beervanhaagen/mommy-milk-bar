// components/DrinkLogTable.tsx - Drink log table with progress bars
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrinkEntry } from '../types/drinks';
import { DrinkType } from '../types/drinks';
import { drinkProgress, Profile } from '../lib/alcohol';
import Svg, { Path } from 'react-native-svg';

interface DrinkLogTableProps {
  entries: DrinkEntry[];
  drinkTypes: Record<string, DrinkType>;
  profile: Profile;
  onDelete?: (entryId: string) => void;
}

// X icon component (close/delete)
const XIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke="#D97671"
      strokeWidth={2.5}
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

  return (
    <View style={styles.table}>
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

          return (
            <View key={entry.id} style={[styles.row, isLast && styles.rowLast]}>
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
              {onDelete && (
                <View style={styles.actionCell}>
                  <TouchableOpacity
                    onPress={() => onDelete(entry.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <XIcon />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
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
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
