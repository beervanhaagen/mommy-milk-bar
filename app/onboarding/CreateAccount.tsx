/**
 * Create Account Screen (Onboarding Flow)
 *
 * Allows users to create an account after completing onboarding
 * Includes privacy consent (GDPR compliance)
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/state/store';
import { signUp } from '../../src/services/auth.service';
import Svg, { Path } from 'react-native-svg';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';

const { width, height } = Dimensions.get('window');

export default function CreateAccount() {
  const router = useRouter();
  const motherName = useStore((state) => state.profile.motherName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert('Oeps', 'Vul alle velden in.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Oeps', 'Voer een geldig e-mailadres in (bijv. naam@example.com).');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Oeps', 'Wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Oeps', 'Wachtwoorden komen niet overeen.');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Oeps', 'Je moet akkoord gaan met de voorwaarden en privacy policy.');
      return;
    }

    setLoading(true);
    try {
      // Create account with Supabase, including onboarding data
      await signUp({
        email,
        password,
        motherName: motherName || undefined,
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

  const openTerms = async () => {
    const url = 'https://mommymilkbar.nl/terms.html';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Oeps', 'Kan voorwaarden niet openen. Bezoek mommymilkbar.nl voor meer info.');
    }
  };

  const openPrivacyPolicy = async () => {
    const url = 'https://mommymilkbar.nl/privacy.html';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Oeps', 'Kan privacy policy niet openen. Bezoek mommymilkbar.nl voor meer info.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatedBackground variant="variant4" />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" fill="#F49B9B" />
          </Svg>
        </TouchableOpacity>

        {/* Mimi Character */}
        <View style={styles.mimiContainer}>
          <Image
            source={require('../../assets/Mimi_karakters/2_mimi_happy_2.png')}
            style={styles.mimiImage}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Je account aanmaken</Text>
          <Text style={styles.subtitle}>Zo kun je je gegevens veilig opslaan en overal bij je persoonlijke adviezen.</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mailadres</Text>
            <TextInput
              style={styles.input}
              placeholder="je@email.nl"
              placeholderTextColor="#C4C1BD"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Wachtwoord (min. 6 tekens)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#C4C1BD"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bevestig wachtwoord</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#C4C1BD"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Terms Checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading}
            >
              <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && (
                  <Svg width={16} height={16} viewBox="0 0 24 24">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#FFFFFF" />
                  </Svg>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.checkboxLabelContainer}>
              <Text style={styles.checkboxLabel}>
                Ik ga akkoord met de{' '}
                <Text style={styles.link} onPress={openTerms}>
                  voorwaarden
                </Text>
                {' '}en{' '}
                <Text style={styles.link} onPress={openPrivacyPolicy}>
                  privacy policy
                </Text>
              </Text>
            </View>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 Je data wordt veilig opgeslagen en nooit gedeeld met derden.
            </Text>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Account aanmaken</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Al een account? </Text>
            <TouchableOpacity onPress={handleLogin} disabled={loading}>
              <Text style={styles.loginLink}>Log hier in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Line */}
        <View style={styles.bottomLine} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
  },
  scrollContent: {
    minHeight: height,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mimiContainer: {
    position: 'absolute',
    height: 180,
    left: width * 0.3,
    right: width * 0.3,
    top: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mimiImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    marginTop: 300,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#4B3B36',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#4B3B36',
    borderWidth: 1,
    borderColor: '#E8E5E1',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E8E5E1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#F49B9B',
    borderColor: '#F49B9B',
  },
  checkboxLabelContainer: {
    flex: 1,
    paddingTop: 2,
  },
  checkboxLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    color: '#8E8B88',
    lineHeight: 20,
  },
  link: {
    color: '#F49B9B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  privacyNote: {
    backgroundColor: '#FFF8F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  privacyText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: '#8E8B88',
    textAlign: 'center',
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 17,
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#8E8B88',
  },
  loginLink: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#F49B9B',
  },
  bottomLine: {
    position: 'absolute',
    width: 143,
    height: 5,
    left: (width - 143) / 2,
    bottom: 20,
    backgroundColor: '#E6E6E6',
  },
});
