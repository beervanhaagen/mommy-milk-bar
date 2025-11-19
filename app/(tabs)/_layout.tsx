import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

// Tab bar icons
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path 
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
      fill={focused ? "#F49B9B" : "#8E8B88"} 
      stroke={focused ? "#F49B9B" : "#8E8B88"} 
      strokeWidth={2}
    />
    <Path d="M9 22V12h6v10" fill="none" stroke={focused ? "#F49B9B" : "#8E8B88"} strokeWidth={2}/>
  </Svg>
);

const FeedingIcon = ({ focused }: { focused: boolean }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path 
      d="M10 2h4v3l2 2v3H8V7l2-2V2z" 
      fill={focused ? "#F49B9B" : "#8E8B88"}
    />
    <Path 
      d="M8 10h8v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" 
      fill="none" 
      stroke={focused ? "#F49B9B" : "#8E8B88"} 
      strokeWidth={2}
    />
  </Svg>
);

const DrinksIcon = ({ focused }: { focused: boolean }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path 
      d="M8 2h8v3l2 2v3H6V7l2-2V2z" 
      fill={focused ? "#F49B9B" : "#8E8B88"}
    />
    <Path 
      d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" 
      fill="none" 
      stroke={focused ? "#F49B9B" : "#8E8B88"} 
      strokeWidth={2}
    />
  </Svg>
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path 
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
      fill="none" 
      stroke={focused ? "#F49B9B" : "#8E8B88"} 
      strokeWidth={2}
    />
    <Path 
      d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" 
      fill="none" 
      stroke={focused ? "#F49B9B" : "#8E8B88"} 
      strokeWidth={2}
    />
  </Svg>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E6E6E6',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins',
          fontWeight: '400',
          fontSize: 12,
          lineHeight: 16,
        },
        tabBarActiveTintColor: '#F49B9B',
        tabBarInactiveTintColor: '#8E8B88',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="drinks"
        options={{
          title: "Drankjes",
          tabBarIcon: ({ focused }) => <DrinksIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profiel",
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
      {/* Voedingen tab verwijderd - niet nodig voor MVP */}
      <Tabs.Screen
        name="feedings"
        options={{
          href: null, // Hide from tab bar but keep route for potential future use
        }}
      />
    </Tabs>
  );
}
