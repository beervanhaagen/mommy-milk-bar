import { View, Text, StyleSheet, TouchableOpacity, Switch, Dimensions, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useStore, getSettings } from "../src/state/store";
import { useAuth } from "../src/contexts/AuthContext";
import { signOut, deleteAccount } from "../src/services/auth.service";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

export default function Settings() {
  const router = useRouter();
  const store = useStore();
  const settings = getSettings();
  const { updateSettings, resetProfile, clearPersistedState } = {
    updateSettings: store.updateSettings,
    resetProfile: store.resetProfile,
    clearPersistedState: store.clearPersistedState,
  };
  const { isAuthenticated, user } = useAuth();

  const toggleNotifications = () => {
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };

  const toggleSafetyMode = () => {
    updateSettings({
      safetyMode: settings.safetyMode === 'normal' ? 'cautious' : 'normal'
    });
  };

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
              router.replace('/landing');
            } catch (error: any) {
              Alert.alert('Fout', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
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
    <View style={styles.container}>
      {/* SVG Background Shape */}
      <Svg
        width={width}
        height={height * 0.3}
        style={styles.svgBackground}
        viewBox="0 0 414 504"
        preserveAspectRatio="xMinYMin slice"
      >
        <Path
          d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z"
          fill="#FFE2D8"
        />
      </Svg>

      <View style={styles.content}>
        {/* Mimi Character */}
        <View style={styles.characterContainer}>
          <Image 
            source={require('../assets/Mimi_karakters/2_mimi_happy_2.png')} 
            style={styles.mimiImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Instellingen</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veiligheid</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Veiligheidsmodus</Text>
              <Text style={styles.settingDescription}>
                {settings.safetyMode === 'normal' ? 'Normaal (2,5u per drankje)' : 'Voorzichtig (3u per drankje)'}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleSafetyMode}>
              <Text style={styles.toggleText}>
                {settings.safetyMode === 'cautious' ? 'Voorzichtig' : 'Normaal'}
              </Text>
            </TouchableOpacity>
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
              value={settings.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#bdc3c7', true: '#3498db' }}
              thumbColor={settings.notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
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
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Deze app geeft alleen algemene richtlijnen. Raadpleeg bij twijfel een zorgverlener.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>← Terug naar home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 200,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mimiImage: {
    width: 120,
    height: 140,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#4B3B36',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Poppins',
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderBottomColor: '#E6E6E6',
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
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#7A6C66',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'Poppins',
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#F49B9B',
    marginBottom: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#F49B9B',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});
