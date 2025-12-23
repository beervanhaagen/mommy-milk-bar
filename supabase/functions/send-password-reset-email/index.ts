// @ts-nocheck
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.1';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ResetPayload = {
  email?: string;
};

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail =
  Deno.env.get('RESEND_FROM_EMAIL_RESET') ??
  'Mommy Milk Bar <info@mommymilkbar.nl>';
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resetRedirectUrl =
  Deno.env.get('PASSWORD_RESET_REDIRECT_URL') ??
  'https://mommymilkbar.nl/reset-password';

const IMAGE_BASE_URL = 'https://www.mommymilkbar.nl/assets/images';
const mimiUrl = `${IMAGE_BASE_URL}/mimi_happy.png`;

if (!resendApiKey) {
  console.warn(
    'Missing RESEND_API_KEY environment variable. Password reset email sending will fail.',
  );
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildHtml = (resetUrl: string) => {
  const safeUrl = escapeHtml(resetUrl);

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stel je wachtwoord opnieuw in</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
      body {
        margin: 0 !important;
        padding: 0 !important;
        font-family: 'Poppins','Helvetica','Arial',sans-serif;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        background-color: #FFFFFF;
      }
      table { border-collapse: collapse; }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; min-width: 100% !important; }
        .card-padding { padding: 24px 20px !important; }
        .title { font-size: 20px !important; line-height: 28px !important; }
        .body-text { font-size: 15px !important; line-height: 22px !important; }
      }
    </style>
  </head>
  <body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#FFFFFF;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#FFFFFF;">
            <tr>
              <td align="center" style="padding:32px 20px 16px;">
                <img src="${mimiUrl}" alt="Mimi van Mommy Milk Bar" style="display:block;border:0;width:82px;height:auto;margin:0 auto 16px;" />
                <h1 class="title" style="margin:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:22px;line-height:30px;font-weight:700;color:#000000;text-align:center;">
                  Wachtwoord opnieuw instellen
                </h1>
              </td>
            </tr>
            <tr>
              <td class="card-padding" align="center" style="padding:0 32px 32px;">
                <p class="body-text" style="margin:0 0 18px;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:15px;line-height:22px;font-weight:400;color:#5E5E5E;text-align:center;">
                  Je hebt gevraagd om je wachtwoord te resetten voor Mommy Milk Bar.
                </p>
                <p class="body-text" style="margin:0 0 24px;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:15px;line-height:22px;font-weight:400;color:#5E5E5E;text-align:center;">
                  Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
                </p>
                <a href="${safeUrl}" style="display:inline-block;padding:14px 32px;border-radius:30px;background-color:#F49B9B;color:#FFFFFF;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:15px;line-height:20px;font-weight:700;text-decoration:none;text-align:center;">
                  Stel nieuw wachtwoord in
                </a>
                <p class="body-text" style="margin:24px 0 0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:13px;line-height:20px;font-weight:400;color:#999999;text-align:center;">
                  Werkt de knop niet? Kopieer dan deze link in je browser:<br/>
                  <span style="word-break:break-all;color:#555555;font-size:12px;">${safeUrl}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 20px 32px;">
                <p style="margin:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:12px;line-height:18px;font-weight:400;color:#999999;text-align:center;">
                  Heb jij dit niet aangevraagd? Negeer deze e-mail dan. Er wordt niets gewijzigd zonder dat jij de link opent.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const buildText = (resetUrl: string) => {
  return `Hoi mama,

Je hebt gevraagd om je wachtwoord voor Mommy Milk Bar te resetten.

Klik op de link hieronder om een nieuw wachtwoord in te stellen:
${resetUrl}

Heb jij dit niet aangevraagd? Negeer deze e-mail dan. Er wordt niets gewijzigd zonder dat jij de link opent.

Liefs,
Mimi van Mommy Milk Bar`;
};

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

  if (!resend) {
    return new Response('Resend client not configured', { status: 500 });
  }

  try {
    const payload = (await req.json()) as ResetPayload;
    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is verplicht' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    // Genereer een password recovery link via service-role Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: resetRedirectUrl,
      },
    });

    if (error || !data?.action_link) {
      console.error('generateLink error:', error);
      console.error('generateLink error message:', error?.message);
      console.error('generateLink error details:', JSON.stringify(error));

      // Handle rate limiting specifically
      const errorMessage = error?.message || '';
      if (errorMessage.includes('only request this after') ||
          errorMessage.includes('rate limit') ||
          errorMessage.includes('too many requests')) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Je hebt recent al een reset link aangevraagd. Controleer je inbox of probeer het over een minuut opnieuw.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Kon reset link niet genereren',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    const resetUrl = data.action_link;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Stel je Mommy Milk Bar wachtwoord opnieuw in',
      html: buildHtml(resetUrl),
      text: buildText(resetUrl),
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(
        JSON.stringify({ success: false, message: emailError.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: emailData?.id }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('send-password-reset-email error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Onverwachte fout' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});















