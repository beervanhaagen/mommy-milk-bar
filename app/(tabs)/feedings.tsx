import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function Feedings() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Voedingen</Text>
      <Text style={styles.subtitle}>Voedingen scherm komt binnenkort</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF4',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    color: '#4B3B36',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 24,
    color: '#8E8B88',
  },
});
