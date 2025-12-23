/**
 * Email Verification Screen
 *
 * Verifies user's email address using token from email link
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { AnimatedBackground } from '../src/components/AnimatedBackground';

const { width, height } = Dimensions.get('window');

type VerificationStatus = 'verifying' | 'success' | 'error';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('Je email wordt geverifieerd...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ongeldige verificatie link.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  async function verifyEmail(verificationToken: string) {
    try {
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { token: verificationToken },
      });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        setMessage('Je email is succesvol geverifieerd!');

        // Redirect to app after 3 seconds
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verificatie mislukt. Link mogelijk verlopen.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setStatus('error');
      setMessage('Er is een fout opgetreden. Probeer opnieuw of neem contact op.');
    }
  }

  return (
    <View style={styles.container}>
      <AnimatedBackground />

      <View style={styles.content}>
        {/* Logo/Mascot */}
        <Image
          source={require('../assets/Mimi_karakters/2_mimi_happy_2.png')}
          style={styles.mascot}
          resizeMode="contain"
        />

        {/* Status Icon */}
        <View style={styles.statusContainer}>
          {status === 'verifying' && (
            <ActivityIndicator size="large" color="#F49B9B" />
          )}
          {status === 'success' && (
            <Text style={styles.statusIcon}>✓</Text>
          )}
          {status === 'error' && (
            <Text style={styles.statusIcon}>!</Text>
          )}
        </View>

        {/* Status Title */}
        <Text style={styles.title}>
          {status === 'success' ? 'Gelukt!' : status === 'error' ? 'Oeps...' : 'Even geduld...'}
        </Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Action Buttons */}
        {status === 'success' && (
          <Text style={styles.redirectText}>
            Je wordt automatisch doorgestuurd...
          </Text>
        )}

        {status === 'error' && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/auth/login')}
          >
            <Text style={styles.buttonText}>Ga naar inloggen</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  mascot: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  statusContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  message: {
    fontSize: 16,
    color: '#5E5E5E',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Poppins',
  },
  redirectText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Poppins',
  },
  button: {
    backgroundColor: '#F49B9B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    maxWidth: 300,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});
