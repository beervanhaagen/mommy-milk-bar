import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useStore } from "../../src/state/store";
import { signUp } from "../../src/services/auth.service";

const { width, height } = Dimensions.get('window');

export default function CreateAccount() {
  const router = useRouter();
  const { settings } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Oeps', 'Vul alle velden in.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Oeps', 'Wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }

    setLoading(true);
    try {
      // Create account with Supabase
      await signUp({
        email,
        password,
        motherName: settings.motherName,
        consentVersion: '1.0.0',
        analyticsConsent: true,
        marketingConsent: false,
      });

      // Navigate to success screen
      router.push('/onboarding/AccountDone');
    } catch (error: any) {
      Alert.alert('Oeps', error.message || 'Er ging iets mis bij het aanmaken van je account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Navigate to login screen
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Background shape */}
        <Svg width={width} height={504} style={styles.onboardingShape} viewBox="0 0 414 504" preserveAspectRatio="xMinYMin slice">
          <Path d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z" fill="#FFE2D8" />
        </Svg>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Je account aanmaken</Text>
          <Text style={styles.subtitle}>Zo kun je je gegevens veilig opslaan en overal bij je persoonlijke adviezen.</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>E-mailadres</Text>
              <TextInput
                style={styles.textInput}
                placeholder="je@email.nl"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Wachtwoord</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Minimaal 8 tekens"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.microcopy}>
              We gebruiken je e-mailadres alleen om je in te loggen. Geen nieuwsbrieven, geen spam.
            </Text>
          </View>
        </View>

        {/* CTAs */}
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Account wordt aangemaakt...' : 'Account aanmaken'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
          <Text style={styles.secondaryButtonText}>Al een account? Inloggen</Text>
        </TouchableOpacity>

        <View style={styles.bottomLine} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF4',
    position: 'relative',
  },
  keyboardView: {
    flex: 1,
  },
  onboardingShape: {
    position: 'absolute',
    width: '100%',
    height: 504,
    left: 0,
    top: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 200,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
    maxWidth: 320,
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 340,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#4B3B36',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#4B3B36',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  microcopy: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#A8A5A2',
    marginTop: 16,
  },
  primaryButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 56,
    bottom: 100,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#D9D9D9',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  secondaryButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 48,
    bottom: 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
  },
  bottomLine: {
    position: 'absolute',
    width: 143,
    height: 5,
    left: (width - 143) / 2,
    bottom: 14,
    backgroundColor: '#E6E6E6',
  },
});
