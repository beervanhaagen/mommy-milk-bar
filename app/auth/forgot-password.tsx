/**
 * Forgot Password Screen
 *
 * Allows users to request a password reset email
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
import { resetPassword } from '../../src/services/auth.service';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Fout', 'Vul je e-mailadres in.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      // resetPassword function already shows success alert
      router.back();
    } catch (error: any) {
      Alert.alert('Fout', error.message);
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
        {/* Background Shape */}
        <Svg
          width={width}
          height={504}
          style={styles.backgroundShape}
          viewBox="0 0 414 504"
          preserveAspectRatio="xMinYMin slice"
        >
          <Path
            d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z"
            fill="#FFE2D8"
          />
        </Svg>

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
          <Text style={styles.title}>Wachtwoord vergeten?</Text>
          <Text style={styles.subtitle}>
            Geen zorgen! Vul je e-mailadres in en we sturen je instructies om je wachtwoord te
            resetten.
          </Text>

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

          {/* Reset Button */}
          <TouchableOpacity
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.resetButtonText}>Verstuur reset link</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backToLoginText}>Terug naar inloggen</Text>
          </TouchableOpacity>
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
    backgroundColor: '#FFFCF4',
  },
  scrollContent: {
    minHeight: height,
    position: 'relative',
  },
  backgroundShape: {
    position: 'absolute',
    width: '100%',
    height: 504,
    left: 0,
    top: 0,
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
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  inputContainer: {
    marginBottom: 24,
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
  resetButton: {
    height: 56,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#FFFFFF',
  },
  backToLogin: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
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
