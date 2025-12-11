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
import { Alert } from 'react-native';
import { generateVerificationToken } from '../lib/verificationToken';

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
    const normalizedEmail = data.email.trim().toLowerCase();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        emailRedirectTo: 'https://mommymilkbar.nl/verify-email',
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    // 2. Generate email verification token
    const verificationToken = await generateVerificationToken();

    // 3. Create profile via server-side function (bypasses RLS)
    const { data: createProfileResponse, error: createProfileError } = await supabase.functions.invoke(
      'create-profile',
      {
        body: {
          userId: authData.user.id,
          email: normalizedEmail,
          motherName: data.motherName || null,
          consentVersion: data.consentVersion || '1.0.0',
          marketingConsent: data.marketingConsent || false,
          analyticsConsent: data.analyticsConsent || false,
          verificationToken,
        },
      }
    );

    if (createProfileError || !createProfileResponse?.success) {
      console.error('Profile initialization failed', createProfileError || createProfileResponse);
      throw new Error(
        createProfileError?.message ||
          createProfileResponse?.message ||
          'Er ging iets mis bij het opslaan van je profiel.'
      );
    }

    // 4. DISABLED: Custom welcome email (has broken verification link)
    // TODO: Re-enable this as a post-verification welcome email
    // For now, Supabase sends its default confirmation email which works properly
    /*
    supabase.functions
      .invoke('send-welcome-email', {
        body: {
          email: normalizedEmail,
          motherName: data.motherName || null,
          verificationToken: verificationToken,
        },
      })
      .catch((emailError) => {
        console.warn('Failed to enqueue welcome email', emailError);
      });
    */

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

    if (error.message?.includes('Email not confirmed')) {
      throw new Error('Je moet eerst je e-mailadres verifiëren. Controleer je inbox voor de verificatiemail.');
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
    const normalizedEmail = email.trim().toLowerCase();

    // TEMPORARY: Skip custom edge function due to database issues
    // Use Supabase's built-in email instead
    // TODO: Debug and fix send-password-reset-email Edge Function
    const usedCustomEmail = false;

    /* Disabled temporarily - has database errors
    let usedCustomEmail = false;
    try {
      const { data, error } = await supabase.functions.invoke(
        'send-password-reset-email',
        {
          body: { email: normalizedEmail },
        }
      );

      if (error || data?.success === false) {
        // If it's a rate limit error, throw it immediately (don't fall back)
        if (data?.message?.includes('recent al een reset link aangevraagd') ||
            data?.message?.includes('rate limit') ||
            error?.message?.includes('rate limit')) {
          throw new Error(data?.message || error?.message || 'Rate limit exceeded');
        }
        console.warn('Password reset edge function failed, falling back to Supabase email:', error || data);
      } else {
        usedCustomEmail = true;
      }
    } catch (fnError: any) {
      // Re-throw rate limit errors, fall back for other errors
      if (fnError.message?.includes('recent al een reset link aangevraagd') ||
          fnError.message?.includes('rate limit')) {
        throw fnError;
      }
      console.warn('Password reset edge function exception, falling back to Supabase email:', fnError);
    }
    */

    // Fallback: gebruik standaard Supabase reset e-mail als edge function niet werkte
    if (!usedCustomEmail) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: 'https://mommymilkbar.nl/reset-password',
        }
      );
      if (resetError) throw resetError;
    }

    Alert.alert(
      'E-mail verzonden',
      'We hebben een e-mail gestuurd met instructies om je wachtwoord te resetten.',
      [{ text: 'OK' }]
    );
  } catch (error: any) {
    console.error('Reset password error:', error);

    // Handle rate limiting error
    if (error.message?.includes('only request this after') ||
        error.message?.includes('rate limit') ||
        error.message?.includes('too many requests')) {
      throw new Error('Je hebt recent al een reset link aangevraagd. Controleer je inbox of probeer het over een minuut opnieuw.');
    }

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
export const deleteAccount = async (options?: { silent?: boolean }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Geen gebruiker gevonden');
    }

    // Call the RLS-protected function to delete all user data
    const { error: dataError } = await supabase.rpc('delete_user_data');

    if (dataError) throw dataError;

    // Delete auth user via service role function
    const { error: deleteUserError } = await supabase.functions.invoke('delete-user', {
      body: { userId: user.id },
    });

    if (deleteUserError) {
      console.error('Failed to delete auth user', deleteUserError);
    }

    // Sign out
    await signOut();

    if (!options?.silent) {
      Alert.alert(
        'Account verwijderd',
        'Je account en alle data zijn succesvol verwijderd.',
        [{ text: 'OK' }]
      );
    }
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
