/**
 * Login Screen
 *
 * Allows existing users to sign in with email/password
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { signIn, resendVerificationEmail } from '../../src/services/auth.service';
import Svg, { Path } from 'react-native-svg';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    // Als er geen vorige scherm is (bijv. na uitloggen), voorkom een GO_BACK warning
    if (router.canGoBack()) {
      router.back();
    } else {
      // Ga dan netjes terug naar het startscherm
      router.replace('/landing');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fout', 'Vul je e-mailadres en wachtwoord in.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
      // Auth state change will automatically navigate via index.tsx
      router.replace('/(tabs)');
    } catch (error: any) {
      // Check if error is about unverified email
      if (error.message?.includes('e-mailadres verifiëren') || error.message?.includes('Email not confirmed')) {
        Alert.alert(
          'E-mail niet geverifieerd',
          'Je moet eerst je e-mailadres verifiëren. Controleer je inbox voor de verificatiemail.',
          [
            { text: 'Annuleren', style: 'cancel' },
            {
              text: 'Opnieuw versturen',
              onPress: async () => {
                try {
                  await resendVerificationEmail(email);
                } catch (resendError: any) {
                  Alert.alert('Fout', resendError.message || 'Kon verificatie e-mail niet versturen');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Inloggen mislukt', error.message);
      }
    } finally {
      setLoading(false);
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
        <AnimatedBackground variant="variant2" />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
          <Text style={styles.title}>Welkom terug!</Text>
          <Text style={styles.subtitle}>Log in om verder te gaan</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mailadres</Text>
            <TextInput
              style={styles.input}
              placeholder="jouw@email.com"
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
            <Text style={styles.label}>Wachtwoord</Text>
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

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/auth/forgot-password' as any)}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Wachtwoord vergeten?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Inloggen</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Nog geen account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/onboarding/CreateAccount')}
              disabled={loading}
            >
              <Text style={styles.signupLink}>Registreer hier</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Line */}
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
    height: 200,
    left: width * 0.3,
    right: width * 0.3,
    top: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mimiImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    marginTop: 350,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 41,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#F49B9B',
  },
  loginButton: {
    height: 56,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#FFFFFF',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#8E8B88',
  },
  signupLink: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#F49B9B',
  },
});
