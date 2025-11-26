// @ts-nocheck
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.1';

type SignupPayload = {
  email?: string;
  motherName?: string | null;
  verificationToken?: string;
};

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail =
  Deno.env.get('RESEND_FROM_EMAIL') ?? 'Mommy Milk Bar <welcome@send.mommymilkbar.nl>';
const verificationBaseUrl = Deno.env.get('VERIFICATION_BASE_URL') ?? 'https://mommymilkbar.nl';
const appStoreUrl = Deno.env.get('APP_STORE_URL') ?? 'https://mommymilkbar.nl/app';
const instagramUrl =
  Deno.env.get('INSTAGRAM_URL') ?? 'https://www.instagram.com/mommymilkbar/';
const preheader =
  'Activeer je e-mail en ontdek hoe Mimi je helpt plannen, loggen en ontspannen.';

// Industry standard: Hosted images (like Amazon, Airbnb, etc. all use)
// Images served from CDN with proper caching
const IMAGE_BASE_URL = 'https://www.mommymilkbar.nl/assets/images';
const imageUrls = {
  mascot: `${IMAGE_BASE_URL}/mimi_happy.png`,
  iphonePlanlog: `${IMAGE_BASE_URL}/iphone_planlog_optimized_tiny.png`,
  iphoneHomescr: `${IMAGE_BASE_URL}/iphone_homescr_optimized_tiny.png`,
  iphonePlanning: `${IMAGE_BASE_URL}/iphone_planning_optimized_tiny.png`,
  appStore: `${IMAGE_BASE_URL}/appdownloadios.png`,
  instagram: `${IMAGE_BASE_URL}/Instagram_logo.png`,
};

if (!resendApiKey) {
  console.warn('Missing RESEND_API_KEY environment variable. Email sending will fail.');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const imageTag = (imageUrl: string, alt: string, extra = '') =>
  `<img src="${imageUrl}" alt="${escapeHtml(alt)}" style="display:block;border:0;max-width:100%;${extra}" />`;

const buildEmailHtml = (name?: string | null, verificationUrl?: string) => {
  const displayName = escapeHtml(name?.split(' ')[0] ?? 'mama');
  const ctaUrl = verificationUrl ?? `${verificationBaseUrl}/app`;

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welkom bij Mommy Milk Bar</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
      body {
        margin: 0 !important;
        padding: 0 !important;
        font-family: 'Poppins', 'Helvetica', 'Arial', sans-serif;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
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
        .content-wrapper { padding: 0 !important; }
        .header-padding { padding: 24px 20px !important; }
        .card-padding { padding: 24px 20px !important; }
        .hero-title { font-size: 20px !important; line-height: 28px !important; }
        .section-title { font-size: 22px !important; line-height: 30px !important; }
        .feature-title { font-size: 18px !important; line-height: 26px !important; }
        .body-text { font-size: 15px !important; line-height: 22px !important; }
        .iphone-mockup { max-width: 200px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#FFFFFF;font-family:'Poppins','Helvetica','Arial',sans-serif;">
    <span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:#FFFFFF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;width:100%;background-color:#FFFFFF;">
      <tr>
        <td align="center" style="padding:0;">

          <!-- Main Container - Full Width -->
          <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0;padding:0;width:100%;max-width:600px;background-color:#FFFFFF;">

            <!-- Header Section -->
            <tr>
              <td class="header-padding" align="center" style="padding:40px 20px 32px;">
                ${imageTag(imageUrls.mascot, 'Mimi', 'width:90px;height:auto;display:block;margin:0 auto 20px;')}
                <h1 class="hero-title" style="margin:0;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:24px;line-height:34px;font-weight:400;color:#000000;text-align:center;">
                  Hi ${displayName},<br/>Welkom bij Mommy Milk Bar,<br/>activeer je account.
                </h1>
              </td>
            </tr>

            <!-- Activation Section -->
            <tr>
              <td align="center" style="padding:0 20px 32px;">
                <h2 style="margin:0 0 14px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:22px;line-height:30px;font-weight:700;color:#000000;text-align:center;">Activeer je email</h2>
                <p class="body-text" style="margin:0 0 24px;padding:0 10px;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;text-align:center;">
                  Je account op Mommy Milk Bar is met succes aangemaakt, je kan nu met meer vertrouwen voeden na een avond uit!
                </p>
                <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;border-radius:30px;background-color:#F49B9B;color:#FFFFFF;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:15px;line-height:20px;font-weight:700;text-decoration:none;text-align:center;">
                  Activeer email adres
                </a>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="border-top:1px solid #E8E8E8;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Features Section -->
            <tr>
              <td align="center" style="padding:32px 20px;">

                <!-- Section Title -->
                <h2 class="section-title" style="margin:0 0 32px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:26px;line-height:34px;font-weight:700;color:#000000;text-align:center;">Waarom Mommy Milk Bar?</h2>

                <!-- Feature 1: Plannen of loggen -->
                <h3 class="feature-title" style="margin:0 0 12px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:20px;line-height:28px;font-weight:700;color:#000000;text-align:center;">Plannen of loggen</h3>
                <p class="body-text" style="margin:0 0 20px;padding:0 10px;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;text-align:center;">
                  Meteen een drankje loggen of plannen voor later of morgen. Jij doet het op jouw manier.
                </p>
                ${imageTag(imageUrls.iphonePlanlog, 'Plannen of loggen', 'max-width:280px;width:100%;height:auto;display:block;margin:0 auto 32px;border-radius:8px;')}

                <!-- Feature 2: Countdown -->
                <h3 class="feature-title" style="margin:0 0 12px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:20px;line-height:28px;font-weight:700;color:#000000;text-align:center;">Countdown</h3>
                <p class="body-text" style="margin:0 0 20px;padding:0 10px;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;text-align:center;">
                  Je countdown loopt. Wij bewaken de tijd, zodat jij alleen hoeft te genieten.
                </p>
                ${imageTag(imageUrls.iphoneHomescr, 'Countdown', 'max-width:280px;width:100%;height:auto;display:block;margin:0 auto 32px;border-radius:8px;')}

                <!-- Feature 3: Planningsoverzicht -->
                <h3 class="feature-title" style="margin:0 0 12px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:20px;line-height:28px;font-weight:700;color:#000000;text-align:center;">Planningsoverzicht</h3>
                <p class="body-text" style="margin:0 0 20px;padding:0 10px;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;text-align:center;">
                  Een intuïtief planningsoverzicht van voeden, kolven en drinken, zodat jij met meer vertrouwen en gemak vooruit plant.
                </p>
                ${imageTag(imageUrls.iphonePlanning, 'Planningsoverzicht', 'max-width:280px;width:100%;height:auto;display:block;margin:0 auto 24px;border-radius:8px;')}

                <!-- Divider -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
                  <tr>
                    <td style="border-top:1px solid #E8E8E8;"></td>
                  </tr>
                </table>

                <!-- App Store Button -->
                <a href="${appStoreUrl}" style="display:inline-block;text-decoration:none;margin-top:8px;">
                  ${imageTag(imageUrls.appStore, 'Download in de App Store', 'width:160px;height:auto;display:block;')}
                </a>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:32px 20px;">
                <a href="${instagramUrl}" style="display:inline-block;text-decoration:none;margin-bottom:16px;">
                  ${imageTag(imageUrls.instagram, 'Volg ons op Instagram', 'width:44px;height:44px;display:block;')}
                </a>
                <p style="margin:0 0 4px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:13px;line-height:18px;font-weight:400;color:#666666;text-align:center;">Copyright © ${new Date().getFullYear()}</p>
                <p style="margin:0 0 4px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:14px;line-height:18px;font-weight:700;color:#000000;text-align:center;">Mommy Milk Bar</p>
                <p style="margin:0;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:13px;line-height:18px;font-weight:400;color:#666666;text-align:center;">Wij helpen je met vertrouwen te genieten</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const buildEmailText = (name?: string | null, verificationUrl?: string) => {
  const displayName = name?.split(' ')[0] ?? 'mama';
  const ctaUrl = verificationUrl ?? `${verificationBaseUrl}/app`;
  return `Hoi ${displayName},

Welkom bij Mommy Milk Bar! Activeer je e-mail en ontdek:
- Plannen of loggen: kies wat past bij jouw avond.
- Countdown: Mimi houdt de tijd bij.
- Planningsoverzicht: inzicht in voeden, kolven en drinken.

Activeer je account: ${ctaUrl}
Download de app: ${appStoreUrl}
Volg ons op Instagram: ${instagramUrl}

Liefs,
Team Mommy Milk Bar`;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!resend) {
    return new Response('Resend client not configured', { status: 500 });
  }

  try {
    const payload = (await req.json()) as SignupPayload;
    const email = payload.email?.trim().toLowerCase();
    const motherName = payload.motherName?.trim() || null;
    const verificationToken = payload.verificationToken;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is verplicht' }), { status: 400 });
    }

    // Build verification URL if token is provided
    const verificationUrl = verificationToken
      ? `${verificationBaseUrl}/verify-email?token=${verificationToken}`
      : undefined;

    // Send email with hosted images (no attachments needed)
    const { data, error} = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welkom bij Mommy Milk Bar',
      html: buildEmailHtml(motherName, verificationUrl),
      text: buildEmailText(motherName, verificationUrl),
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-welcome-email error:', error);
    return new Response(JSON.stringify({ error: 'Onverwachte fout' }), { status: 500 });
  }
});

