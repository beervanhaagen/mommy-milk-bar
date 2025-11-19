import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export const ClockIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const BabyIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke={color} strokeWidth="2"/>
    <Circle cx="9" cy="9" r="1" fill={color}/>
    <Circle cx="15" cy="9" r="1" fill={color}/>
  </Svg>
);

export const MilkIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3h18v18H3z" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M8 8h8v12H8z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1"/>
    <Path d="M12 8v12" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const WineIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20" stroke={color} strokeWidth="2"/>
    <Path d="M8 6h8" stroke={color} strokeWidth="2"/>
    <Path d="M10 10h4" stroke={color} strokeWidth="2"/>
    <Path d="M12 14v6" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const TimelineIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12h18" stroke={color} strokeWidth="2"/>
    <Path d="M3 6h18" stroke={color} strokeWidth="2"/>
    <Path d="M3 18h18" stroke={color} strokeWidth="2"/>
    <Circle cx="6" cy="6" r="2" fill={color}/>
    <Circle cx="6" cy="12" r="2" fill={color}/>
    <Circle cx="6" cy="18" r="2" fill={color}/>
  </Svg>
);

export const SafeIcon = ({ size = 24, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const WarningIcon = ({ size = 24, color = '#FF9800' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 9v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const PlusIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const MinusIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const EditIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const DeleteIcon = ({ size = 24, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 11v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const InfoIcon = ({ size = 20, color = '#F49B9B' }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="8" stroke={color} strokeWidth="2"/>
    <Path d="M10 6v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="10" cy="13" r="1.2" fill={color}/>
  </Svg>
);
