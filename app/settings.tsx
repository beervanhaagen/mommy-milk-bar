import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, SafeAreaView, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../src/state/store";
import { useAuth } from "../src/contexts/AuthContext";
import { signOut, deleteAccount } from "../src/services/auth.service";
import Svg, { Path } from "react-native-svg";

export default function Settings() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);
  const updateSettings = useStore((state) => state.updateSettings);
  const resetProfile = useStore((state) => state.resetProfile);
  const clearPersistedState = useStore((state) => state.clearPersistedState);
  const syncToSupabase = useStore((state) => state.syncToSupabase);
  const { isAuthenticated, user } = useAuth();

  const persistProfile = async () => {
    try {
      await syncToSupabase();
    } catch (error: any) {
      Alert.alert('Opslaan mislukt', error.message || 'Kon wijzigingen niet synchroniseren. Probeer later opnieuw.');
    }
  };

  const toggleNotifications = async () => {
    updateSettings({ notificationsEnabled: !profile.notificationsEnabled });
    await persistProfile();
  };

  // Safety mode is now a fixed conservative default (+15%) in the backend.
  // We keep the label for transparency but no longer toggle modes.

  const handleLogout = async () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Clear local state
              resetProfile();
              await clearPersistedState();
              // Redirect to login so gebruikers direct kunnen inloggen
              router.replace('/auth/login');
            } catch (error: any) {
              Alert.alert('Fout', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    // Check if user is actually authenticated
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Niet ingelogd',
        'Je bent niet ingelogd. Log eerst in om je account te verwijderen.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Account verwijderen',
      'Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt en al je data wordt permanent verwijderd.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            const clearLegacySettings = () =>
              updateSettings({
                motherBirthdate: undefined,
                motherName: undefined,
                babyBirthdate: undefined,
                babyName: undefined,
                weightKg: undefined,
                heightCm: undefined,
                babyWeightKg: undefined,
                babyLengthCm: undefined,
                feedingType: undefined,
                pumpPreference: undefined,
                feedsPerDay: undefined,
                typicalAmountMl: undefined,
                hasCompletedOnboarding: false,
                ageConsent: false,
                medicalDisclaimerConsent: false,
                privacyPolicyConsent: false,
                marketingConsent: false,
                analyticsConsent: false,
                safetyMode: 'cautious',
              });

            try {
              try {
                await deleteAccount({ silent: true });
              } catch (remoteError: any) {
                console.warn('Supabase account deletion skipped:', remoteError?.message || remoteError);
                await signOut().catch(() => {});
              }

              clearLegacySettings();
              resetProfile();
              await clearPersistedState();

              Alert.alert('Account verwijderd', 'Je bent terug bij het startscherm.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/landing'),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Fout', error.message || 'Verwijderen mislukt, probeer later opnieuw.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButtonTop}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonTopText}>← Terug</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Instellingen</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veiligheid</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Veiligheidsmarge</Text>
              <Text style={styles.settingDescription}>
                We voegen automatisch ~15% extra wachttijd toe bovenop de wetenschappelijke richtlijnen (LactMed).
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaties</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Herinneringen</Text>
              <Text style={styles.settingDescription}>
                Ontvang een melding wanneer het veilig is om te voeden
              </Text>
            </View>
            <Switch
              value={profile.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#bdc3c7', true: '#F49B9B' }}
              thumbColor={profile.notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & voorkeuren</Text>

          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/settings/consents')}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Consentcentrum</Text>
              <Text style={styles.settingDescription}>
                Beheer marketing-, analytics- en privacyvoorkeuren op één plek.
              </Text>
            </View>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/medical-info')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Berekeningen & Medische Informatie</Text>
              <Text style={styles.settingDescription}>
                Lees meer over hoe onze berekeningen werken en belangrijke medische informatie.
              </Text>
            </View>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section - Only show if authenticated */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>E-mailadres</Text>
              <Text style={styles.settingValue}>{user?.email}</Text>
            </View>

            <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
              <Text style={styles.settingLabel}>Uitloggen</Text>
              <Text style={styles.settingValue}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Account verwijderen</Text>
              <Text style={styles.dangerText}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Over</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Versie</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/medical-info')}
          >
            <Text style={styles.settingLabel}>Berekeningen & Medische Informatie</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Linking.openURL('https://mommymilkbar.nl/privacy.html')}
          >
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Linking.openURL('https://mommymilkbar.nl/terms.html')}
          >
            <Text style={styles.settingLabel}>Algemene Voorwaarden</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Linking.openURL('mailto:info@mommymilkbar.nl')}
          >
            <Text style={styles.settingLabel}>Contact</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Deze app geeft alleen algemene richtlijnen. Raadpleeg bij twijfel een zorgverlener.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#4B3B36',
    textAlign: 'left',
    marginBottom: 24,
    fontFamily: 'Poppins',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4B3B36',
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E7E2',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B3B36',
    marginBottom: 4,
    fontFamily: 'Poppins',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7A6C66',
    fontFamily: 'Poppins',
  },
  settingValue: {
    fontSize: 16,
    color: '#7A6C66',
    fontFamily: 'Poppins',
  },
  toggleText: {
    fontSize: 16,
    color: '#F49B9B',
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  dangerText: {
    color: '#E74C3C',
  },
  disclaimer: {
    backgroundColor: '#FFF3F2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#7A6C66',
    textAlign: 'left',
    lineHeight: 16,
    fontFamily: 'Poppins',
  },
  backButtonTop: {
  paddingHorizontal: 24,
  paddingTop: 20,
  paddingBottom: 8,
  },
  backButtonTopText: {
  color: '#F49B9B',
  fontSize: 16,
  fontWeight: '500',
  fontFamily: 'Poppins',
  },
  backButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: '#F49B9B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});
