// @ts-nocheck
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    const {
      userId,
      email,
      motherName,
      consentVersion,
      marketingConsent,
      analyticsConsent,
      verificationToken,
    } = payload;

    if (!userId || !email || !verificationToken) {
      console.error('Missing required fields:', { userId: !!userId, email: !!email, verificationToken: !!verificationToken });
      return new Response(
        JSON.stringify({
          success: false,
          message: 'userId, email en verificationToken zijn verplicht',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      console.error('getUser error', userError);
      return new Response(
        JSON.stringify({ success: false, message: 'Gebruiker niet gevonden' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userData.user.email?.toLowerCase() !== normalizedEmail) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email komt niet overeen met gebruiker' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();

    const profileData = {
      id: userId,
      // GDPR Consent fields
      consent_version: consentVersion || '1.0.0',
      age_consent: true, // Required for signup
      medical_disclaimer_consent: true, // Required for signup
      privacy_policy_consent: true, // Required for signup
      marketing_consent: marketingConsent ?? false,
      analytics_consent: analyticsConsent ?? false,
      consent_timestamp: now,
      // Onboarding
      has_completed_onboarding: false,
      // Preferences
      notifications_enabled: true,
      safety_mode: 'cautious', // Default to cautious mode
    };

    console.log('Upserting profile data:', JSON.stringify(profileData, null, 2));

    const { error: upsertError } = await supabase.from('profiles').upsert(
      profileData,
      {
        onConflict: 'id',
      }
    );

    if (upsertError) {
      console.error('Upsert profile error', upsertError);
      console.error('Upsert error details:', JSON.stringify(upsertError, null, 2));
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Profiel opslaan mislukt',
          error: upsertError.message,
          details: upsertError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile created successfully for user:', userId);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('create-profile error', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Onverwachte fout' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

