/**
 * Profile Service
 *
 * Handles syncing user profile and baby data with Supabase
 *
 * Key functions:
 * - syncProfileToSupabase: Save mother's profile data
 * - syncBabyToSupabase: Save baby data
 * - loadProfileFromSupabase: Load all user data from database
 * - syncAllData: Complete sync of profile + all babies
 */

import { supabase } from '../lib/supabase';
import { ProfileInsert, BabyInsert } from '../types/database';
import { MotherProfile, Baby } from '../state/store';
import { generateVerificationToken } from '../lib/verificationToken';

// =====================================================
// PROFILE SYNC
// =====================================================

/**
 * Sync mother's profile to Supabase
 */
export const syncProfileToSupabase = async (profile: MotherProfile): Promise<void> => {
  try {
    // Get current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    const profileData: ProfileInsert = {
      id: user.id,
      email: profile.email || user.email || null,
      email_verified: profile.emailVerified ?? false,
      weight_kg: profile.weightKg || null,
      safety_mode: profile.safetyMode,
      notifications_enabled: profile.notificationsEnabled,
      has_completed_onboarding: profile.hasCompletedOnboarding,
      onboarding_completed_at: profile.onboardingCompletedAt || null,

      // Consent fields
      consent_version: profile.consentVersion,
      age_consent: profile.ageConsent ?? false,
      medical_disclaimer_consent: profile.medicalDisclaimerConsent ?? false,
      privacy_policy_consent: profile.privacyPolicyConsent ?? false,
      marketing_consent: profile.marketingConsent ?? false,
      analytics_consent: profile.analyticsConsent ?? false,
      consent_timestamp: profile.consentTimestamp || null,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
      });

    if (error) throw error;

    console.log('✅ Profile synced to Supabase');
  } catch (error: any) {
    console.error('❌ Failed to sync profile:', error);
    throw new Error(error.message || 'Failed to sync profile to Supabase');
  }
};

// =====================================================
// BABY SYNC
// =====================================================

/**
 * Sync a baby's data to Supabase
 */
export const syncBabyToSupabase = async (baby: Baby): Promise<void> => {
  try {
    // Get current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    // Use generic label instead of real name (privacy-friendly)
    const displayLabel = baby.name && baby.name !== 'prefer_not_to_share'
      ? baby.name  // If they provided a name, use it as the label for now
      : 'Baby 1';  // Default label

    const babyData: BabyInsert = {
      id: baby.id,
      user_id: user.id,
      display_label: displayLabel,
      birthdate: baby.birthdate,
      feeding_type: baby.feedingType || null,
      feeds_per_day: baby.feedsPerDay || null,
      typical_amount_ml: baby.typicalAmountMl || null,
      pump_preference: baby.pumpPreference || null,
      is_active: baby.isActive,
    };

    const { error } = await supabase
      .from('babies')
      .upsert(babyData, {
        onConflict: 'id',
      });

    if (error) throw error;

    console.log(`✅ Baby ${baby.id} synced to Supabase`);
  } catch (error: any) {
    console.error(`❌ Failed to sync baby:`, error);
    throw new Error(error.message || 'Failed to sync baby to Supabase');
  }
};

/**
 * Delete a baby from Supabase
 */
export const deleteBabyFromSupabase = async (babyId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('babies')
      .delete()
      .eq('id', babyId);

    if (error) throw error;

    console.log(`✅ Baby ${babyId} deleted from Supabase`);
  } catch (error: any) {
    console.error(`❌ Failed to delete baby:`, error);
    throw new Error(error.message || 'Failed to delete baby from Supabase');
  }
};

// =====================================================
// LOAD DATA
// =====================================================

/**
 * Load profile and babies from Supabase
 */
export const loadProfileFromSupabase = async (): Promise<{
  profile: MotherProfile | null;
  babies: Baby[];
}> => {
  try {
    // Get current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    // Load profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (acceptable for new users)
      throw profileError;
    }

    // Load babies
    const { data: babiesData, error: babiesError } = await supabase
      .from('babies')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (babiesError) throw babiesError;

    // Map to local types
    const profile: MotherProfile | null = profileData ? {
      id: profileData.id,
      email: profileData.email || undefined,
      emailVerified: profileData.email_verified,
      weightKg: profileData.weight_kg || undefined,
      safetyMode: profileData.safety_mode,
      notificationsEnabled: profileData.notifications_enabled,
      hasCompletedOnboarding: profileData.has_completed_onboarding,
      onboardingCompletedAt: profileData.onboarding_completed_at || undefined,
      consentVersion: profileData.consent_version,
      ageConsent: profileData.age_consent,
      medicalDisclaimerConsent: profileData.medical_disclaimer_consent,
      privacyPolicyConsent: profileData.privacy_policy_consent,
      marketingConsent: profileData.marketing_consent,
      analyticsConsent: profileData.analytics_consent,
      consentTimestamp: profileData.consent_timestamp || undefined,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
      lastActiveAt: profileData.last_active_at,
    } : null;

    const babies: Baby[] = (babiesData || []).map(baby => ({
      id: baby.id,
      name: baby.display_label || undefined,
      birthdate: baby.birthdate,
      feedingType: baby.feeding_type || undefined,
      feedsPerDay: baby.feeds_per_day || undefined,
      typicalAmountMl: baby.typical_amount_ml || undefined,
      pumpPreference: baby.pump_preference || undefined,
      isActive: baby.is_active,
      createdAt: baby.created_at,
      updatedAt: baby.updated_at,
    }));

    console.log(`✅ Loaded profile and ${babies.length} babies from Supabase`);

    return { profile, babies };
  } catch (error: any) {
    console.error('❌ Failed to load profile:', error);
    throw new Error(error.message || 'Failed to load profile from Supabase');
  }
};

// =====================================================
// COMPLETE SYNC
// =====================================================

/**
 * Sync all data (profile + all babies) to Supabase
 */
export const syncAllDataToSupabase = async (
  profile: MotherProfile,
  babies: Baby[]
): Promise<void> => {
  try {
    // Sync profile first
    await syncProfileToSupabase(profile);

    // Sync all babies
    await Promise.all(babies.map(baby => syncBabyToSupabase(baby)));

    console.log(`✅ Synced profile and ${babies.length} babies to Supabase`);
  } catch (error: any) {
    console.error('❌ Failed to sync all data:', error);
    throw new Error(error.message || 'Failed to sync data to Supabase');
  }
};

// =====================================================
// ANALYTICS & TRACKING
// =====================================================

/**
 * Track user activity (update last_active_at)
 */
export const trackUserActivity = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);

    console.log('✅ User activity tracked');
  } catch (error: any) {
    console.error('❌ Failed to track activity:', error);
    // Non-critical, don't throw
  }
};

/**
 * Log analytics event
 */
export const logAnalyticsEvent = async (
  eventType: string,
  eventData: Record<string, any> = {}
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Only log if user has consented
    const { data: profile } = await supabase
      .from('profiles')
      .select('analytics_consent')
      .eq('id', user?.id || '')
      .single();

    if (!profile?.analytics_consent) {
      console.log('⏭️  Analytics event skipped (no consent)');
      return;
    }

    await supabase
      .from('analytics_events')
      .insert({
        user_id: user?.id || null,
        event_type: eventType,
        event_data: eventData,
      });

    console.log(`✅ Analytics event logged: ${eventType}`);
  } catch (error: any) {
    console.error('❌ Failed to log analytics event:', error);
    // Non-critical, don't throw
  }
};

// =====================================================
// EMAIL VERIFICATION
// =====================================================

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string): Promise<boolean> => {
  try {
    // Use Edge Function instead of RPC for better portability
    const { data, error } = await supabase.functions.invoke('verify-email', {
      body: { token },
    });

    if (error) throw error;

    // Support both boolean and { success: boolean } style responses
    if (typeof data === 'boolean') {
      return data;
    }
    if (data && typeof (data as any).success === 'boolean') {
      return (data as any).success;
    }

    return true;
  } catch (error: any) {
    console.error('❌ Failed to verify email:', error);
    return false;
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Get profile to get email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile?.email) throw new Error('No email address found');

    // Generate new token
    const verificationToken = await generateVerificationToken();

    // Update profile
    await supabase
      .from('profiles')
      .update({
        email_verification_token: verificationToken,
        email_verification_sent_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Send email
    await supabase.functions.invoke('send-welcome-email', {
      body: {
        email: profile.email,
        motherName: profile.display_name || null,
        verificationToken: verificationToken,
      },
    });

    console.log('✅ Verification email sent');
  } catch (error: any) {
    console.error('❌ Failed to resend verification email:', error);
    throw new Error(error.message || 'Failed to resend verification email');
  }
};
