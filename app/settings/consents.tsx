import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../src/state/store";

type ConsentKey =
  | "ageConsent"
  | "medicalDisclaimerConsent"
  | "privacyPolicyConsent"
  | "marketingConsent"
  | "analyticsConsent";

const consentItems: Array<{
  key: ConsentKey;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
  required?: boolean; // Required consents cannot be toggled off
}> = [
  {
    key: "ageConsent",
    title: "18+ bevestiging",
    description: "Verplicht: Je hebt bij registratie bevestigd dat je 18 jaar of ouder bent.",
    link: "https://mommymilkbar.nl/terms.html",
    linkLabel: "Waarom vragen we dit?",
    required: true,
  },
  {
    key: "medicalDisclaimerConsent",
    title: "Medische disclaimer",
    description: "Verplicht: Je hebt bij registratie akkoord gegeven dat MMB alleen indicaties geeft, geen medisch advies. Alle keuzes zijn je eigen verantwoordelijkheid en kunnen niet worden teruggevoerd op MMB.",
    link: "/medical-info",
    linkLabel: "Lees meer",
    required: true,
  },
  {
    key: "privacyPolicyConsent",
    title: "Privacy & data",
    description: "Verplicht: Je hebt bij registratie toegestaan dat we je gegevens veilig opslaan.",
    link: "https://mommymilkbar.nl/privacy.html",
    linkLabel: "Privacy policy",
    required: true,
  },
  {
    key: "marketingConsent",
    title: "Updates & tips",
    description: "Ontvang af en toe productupdates en tips van Mommy Milk Bar.",
    link: "https://mommymilkbar.nl/privacy.html#marketing",
    linkLabel: "Wat sturen we?",
    required: false,
  },
  {
    key: "analyticsConsent",
    title: "Anonieme analytics",
    description: "Help ons de app te verbeteren met geanonimiseerde gebruiksdata.",
    link: "https://mommymilkbar.nl/privacy.html#analytics",
    linkLabel: "Meer over analytics",
    required: false,
  },
];

export default function ConsentCenter() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);
  const updateSettings = useStore((state) => state.updateSettings);
  const syncToSupabase = useStore((state) => state.syncToSupabase);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleToggle = async (key: ConsentKey, value: boolean, isRequired: boolean) => {
    // Prevent disabling required consents
    if (isRequired && !value) {
      Alert.alert(
        'Verplichte toestemming',
        'Deze toestemming is verplicht voor het gebruik van de app. Als je deze wilt intrekken, moet je je account verwijderen via Instellingen > Account verwijderen.',
        [{ text: 'OK' }]
      );
      return;
    }

    updateSettings({
      [key]: value,
      consentTimestamp: new Date().toISOString(),
    });

    setIsSyncing(true);
    try {
      await syncToSupabase();
    } catch (error: any) {
      console.error('Consent sync error:', error);
      Alert.alert('Opslaan mislukt', error.message || 'Kon je voorkeur niet opslaan. Probeer later opnieuw.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackPress = () => {
    if (isSyncing) {
      Alert.alert(
        'Even geduld',
        'Je wijzigingen worden nog opgeslagen. Probeer het over een moment opnieuw.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.back();
  };

  const openLink = async (url?: string) => {
    if (!url) return;
    
    // Handle internal routes (starting with /)
    if (url.startsWith('/')) {
      router.push(url);
      return;
    }
    
    // Handle external URLs
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Oeps', 'Kon de link niet openen. Bezoek mommymilkbar.nl voor meer info.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Consent & voorkeuren</Text>
        <Text style={styles.subtitle}>
          Pas hier je optionele voorkeuren aan. Verplichte toestemmingen kun je niet uitzetten zonder je account te verwijderen.
        </Text>

        {consentItems.map((item) => (
          <View key={item.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                {item.link && (
                  <TouchableOpacity onPress={() => openLink(item.link)}>
                    <Text style={styles.link}>{item.linkLabel || 'Lees meer'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Switch
                value={!!(profile as any)[item.key]}
                onValueChange={(val) => handleToggle(item.key, val, item.required || false)}
                trackColor={{ false: '#bdc3c7', true: '#F49B9B' }}
                thumbColor={(profile as any)[item.key] ? '#FFFFFF' : '#f4f3f4'}
                disabled={item.required} // Disable toggle for required consents
              />
            </View>
          </View>
        ))}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Laatste wijziging: {profile.consentTimestamp
              ? new Date(profile.consentTimestamp).toLocaleString('nl-NL')
              : 'nog niet opgeslagen'}
          </Text>
          <Text style={styles.noteText}>
            Consentversie: {profile.consentVersion || '1.0.0'}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.backButton, isSyncing && styles.backButtonDisabled]}
        onPress={handleBackPress}
        disabled={isSyncing}
      >
        <Text style={styles.backButtonText}>
          {isSyncing ? 'Opslaan...' : 'Terug naar instellingen'}
        </Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#4B3B36',
    marginBottom: 8,
    fontFamily: 'Quicksand',
  },
  subtitle: {
    fontSize: 14,
    color: '#7A6C66',
    marginBottom: 24,
    fontFamily: 'Poppins',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3B36',
    marginBottom: 6,
    fontFamily: 'Poppins',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7A6C66',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  link: {
    fontSize: 13,
    color: '#E47C7C',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins',
  },
  note: {
    marginTop: 8,
    backgroundColor: '#FFF3F2',
    padding: 16,
    borderRadius: 16,
  },
  noteText: {
    fontSize: 12,
    color: '#7A6C66',
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
    fontFamily: 'Poppins',
  },
  backButtonDisabled: {
    backgroundColor: '#D8A8A8',
    opacity: 0.7,
  },
});

