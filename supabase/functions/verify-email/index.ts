// @ts-nocheck
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Token is verplicht' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user with this token in profiles table
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id, email, email_verified, email_verification_sent_at')
      .eq('email_verification_token', token)
      .single();

    if (findError || !profile) {
      return new Response(
        JSON.stringify({ success: false, message: 'Ongeldige of verlopen verificatie link' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Check if already verified
    if (profile.email_verified) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email is al geverifieerd' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Check if token is expired (24 hours)
    if (profile.email_verification_sent_at) {
      const sentAt = new Date(profile.email_verification_sent_at);
      const now = new Date();
      const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSent > 24) {
        return new Response(
          JSON.stringify({ success: false, message: 'Verificatie link is verlopen. Vraag een nieuwe aan.' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    }

    // Update profile as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        email_verification_token: null, // Clear token for security
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, message: 'Database fout' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email succesvol geverifieerd!' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Onverwachte fout' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});
