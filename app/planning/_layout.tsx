import { Stack } from "expo-router";

export default function PlanningLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="smart" />
      <Stack.Screen name="inline" />
      <Stack.Screen name="start" />
      <Stack.Screen name="details" />
      <Stack.Screen name="context" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
