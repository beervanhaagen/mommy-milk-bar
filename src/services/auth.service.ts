/**
 * Authentication Service
 *
 * Handles all authentication operations:
 * - Email/password signup & signin
 * - Apple Sign In (future)
 * - Session management
 * - Profile creation
 */

import { supabase } from '../lib/supabase';
import { ProfileInsert } from '../types/database';
import { Alert } from 'react-native';

export type SignUpData = {
  email: string;
  password: string;
  motherName?: string;
  consentVersion?: string;
  marketingConsent?: boolean;
  analyticsConsent?: boolean;
};

export type SignInData = {
  email: string;
  password: string;
};

/**
 * Sign up a new user with email/password
 * Also creates a profile in the profiles table
 */
export const signUp = async (data: SignUpData) => {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    // 2. Create profile
    const profileData: ProfileInsert = {
      id: authData.user.id,
      mother_name: data.motherName || null,
      consent_version: data.consentVersion || '1.0.0',
      marketing_consent: data.marketingConsent || false,
      analytics_consent: data.analyticsConsent || false,
      has_completed_onboarding: false,
      notifications_enabled: true,
      safety_mode: 'normal',
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      console.error('Profile creation failed, cleaning up auth user');
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return { user: authData.user, session: authData.session };
  } catch (error: any) {
    console.error('Sign up error:', error);

    // User-friendly error messages
    if (error.message?.includes('already registered')) {
      throw new Error('Dit e-mailadres is al in gebruik.');
    } else if (error.message?.includes('invalid email')) {
      throw new Error('Ongeldig e-mailadres.');
    } else if (error.message?.includes('password')) {
      throw new Error('Wachtwoord moet minimaal 6 tekens bevatten.');
    }

    throw new Error(error.message || 'Er is iets misgegaan bij het aanmaken van je account.');
  }
};

/**
 * Sign in existing user with email/password
 */
export const signIn = async (data: SignInData) => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    // Update last_active_at
    if (authData.user) {
      await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', authData.user.id);
    }

    return { user: authData.user, session: authData.session };
  } catch (error: any) {
    console.error('Sign in error:', error);

    if (error.message?.includes('Invalid login credentials')) {
      throw new Error('Onjuist e-mailadres of wachtwoord.');
    }

    throw new Error(error.message || 'Er is iets misgegaan bij het inloggen.');
  }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Er is iets misgegaan bij het uitloggen.');
  }
};

/**
 * Get current session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Reset password (send reset email)
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'mommymilkbar://reset-password', // Deep link
    });

    if (error) throw error;

    Alert.alert(
      'E-mail verzonden',
      'We hebben een e-mail gestuurd met instructies om je wachtwoord te resetten.',
      [{ text: 'OK' }]
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw new Error(error.message || 'Er is iets misgegaan bij het resetten van je wachtwoord.');
  }
};

/**
 * Update password (when user is logged in)
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    Alert.alert(
      'Wachtwoord gewijzigd',
      'Je wachtwoord is succesvol gewijzigd.',
      [{ text: 'OK' }]
    );
  } catch (error: any) {
    console.error('Update password error:', error);
    throw new Error(error.message || 'Er is iets misgegaan bij het wijzigen van je wachtwoord.');
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Check if user email is verified
 */
export const isEmailVerified = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.email_confirmed_at !== null;
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) throw error;

    Alert.alert(
      'E-mail verzonden',
      'We hebben een nieuwe verificatie e-mail gestuurd.',
      [{ text: 'OK' }]
    );
  } catch (error: any) {
    console.error('Resend verification error:', error);
    throw new Error(error.message || 'Er is iets misgegaan bij het versturen van de verificatie e-mail.');
  }
};

/**
 * Delete user account (GDPR compliance)
 * This will trigger cascading deletes for all related data
 */
export const deleteAccount = async () => {
  try {
    // Call the RLS-protected function to delete all user data
    const { error: dataError } = await supabase.rpc('delete_user_data');

    if (dataError) throw dataError;

    // Sign out
    await signOut();

    Alert.alert(
      'Account verwijderd',
      'Je account en alle data zijn succesvol verwijderd.',
      [{ text: 'OK' }]
    );
  } catch (error: any) {
    console.error('Delete account error:', error);
    throw new Error(error.message || 'Er is iets misgegaan bij het verwijderen van je account.');
  }
};

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = async () => {
  try {
    const { data, error } = await supabase.rpc('export_user_data');

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('Export data error:', error);
    throw new Error(error.message || 'Er is iets misgegaan bij het exporteren van je data.');
  }
};
