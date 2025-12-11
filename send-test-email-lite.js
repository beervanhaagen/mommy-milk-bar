#!/usr/bin/env node

/**
 * Send Test Welcome Email (Lite Version - Optimized for Email Size)
 * Uses only the banner image instead of large iPhone mockups
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || 'YOUR_RESEND_API_KEY';
const TO_EMAIL = process.env.TO_EMAIL || 'info@mommymilkbar.nl';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Mommy Milk Bar <onboarding@resend.dev>'; // Using Resend's test domain for mail-tester

// Helper function to convert image to base64
function imageToBase64(imagePath) {
  try {
    const fullPath = path.join(__dirname, imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Failed to load ${imagePath}:`, error.message);
    return '';
  }
}

// Load optimized assets (including optimized iPhone mockups ~50KB each)
console.log('📦 Loading email assets...');
const assets = {
  mascot: imageToBase64('supabase/functions/send-welcome-email/assets/mimi_happy.png'),
  banner: imageToBase64('supabase/functions/send-welcome-email/assets/plannenloggenbanner_v2.png'),
  iphonePlanlog: imageToBase64('supabase/functions/send-welcome-email/assets/iphone_planlog_optimized.png'),
  iphoneHomescr: imageToBase64('supabase/functions/send-welcome-email/assets/iphone_homescr_optimized.png'),
  iphonePlanning: imageToBase64('supabase/functions/send-welcome-email/assets/iphone_planning_optimized.png'),
  appStore: imageToBase64('supabase/functions/send-welcome-email/assets/appdownloadios.png'),
  instagram: imageToBase64('supabase/functions/send-welcome-email/assets/Instagram_logo.png'),
};

// Helper to create image tag
const imageTag = (src, alt, extra = '') =>
  src ? `<img src="${src}" alt="${alt}" style="display:block;border:0;max-width:100%;${extra}" />` : '';

// Build email HTML
const displayName = 'Tess';
const preheader = 'Activeer je e-mail en ontdek hoe Mimi je helpt plannen, loggen en ontspannen.';

const emailHtml = `<!doctype html>
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
                ${imageTag(assets.mascot, 'Mimi', 'width:90px;height:auto;display:block;margin:0 auto 20px;')}
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
                <a href="https://mommymilkbar.nl/app" style="display:inline-block;padding:14px 32px;border-radius:30px;background-color:#F49B9B;color:#FFFFFF;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:15px;line-height:20px;font-weight:700;text-decoration:none;text-align:center;">
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
                ${imageTag(assets.iphonePlanlog, 'Plannen of loggen', 'max-width:280px;width:100%;height:auto;display:block;margin:0 auto 32px;border-radius:8px;')}

                <!-- Feature 2: Countdown -->
                <h3 class="feature-title" style="margin:0 0 12px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:20px;line-height:28px;font-weight:700;color:#000000;text-align:center;">Countdown</h3>
                <p class="body-text" style="margin:0 0 20px;padding:0 10px;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;text-align:center;">
                  Je countdown loopt. Wij bewaken de tijd, zodat jij alleen hoeft te genieten.
                </p>
                ${imageTag(assets.iphoneHomescr, 'Countdown', 'max-width:280px;width:100%;height:auto;display:block;margin:0 auto 32px;border-radius:8px;')}

                <!-- Feature 3: Planningsoverzicht -->
                <h3 class="feature-title" style="margin:0 0 12px;padding:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:20px;line-height:28px;font-weight:700;color:#000000;text-align:center;">Planningsoverzicht</h3>
                <p class="body-text" style="margin:0 0 20px;padding:0 10px;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;text-align:center;">
                  Een intuïtief planningsoverzicht van voeden, kolven en drinken, zodat jij met meer vertrouwen en gemak vooruit plant.
                </p>
                ${imageTag(assets.iphonePlanning, 'Planningsoverzicht', 'max-width:280px;width:100%;height:auto;display:block;margin:0 auto 24px;border-radius:8px;')}

                <!-- Divider -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
                  <tr>
                    <td style="border-top:1px solid #E8E8E8;"></td>
                  </tr>
                </table>

                <!-- App Store Button -->
                <a href="https://mommymilkbar.nl/app" style="display:inline-block;text-decoration:none;margin-top:8px;">
                  ${imageTag(assets.appStore, 'Download in de App Store', 'width:160px;height:auto;display:block;')}
                </a>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:32px 20px;">
                <a href="https://www.instagram.com/mommymilkbar/" style="display:inline-block;text-decoration:none;margin-bottom:16px;">
                  ${imageTag(assets.instagram, 'Volg ons op Instagram', 'width:44px;height:44px;display:block;')}
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

// Check API key
if (!RESEND_API_KEY || RESEND_API_KEY === 'YOUR_RESEND_API_KEY') {
  console.error('❌ RESEND_API_KEY not set!');
  console.error('Please run: RESEND_API_KEY=re_your_key node send-test-email-lite.js');
  process.exit(1);
}

// Send email via Resend API
console.log('📧 Sending test email to:', TO_EMAIL);
console.log('📦 Email size: ~', Math.round(emailHtml.length / 1024), 'KB');

const emailData = {
  from: FROM_EMAIL,
  to: TO_EMAIL,
  subject: 'Welkom bij Mommy Milk Bar 💜',
  html: emailHtml,
};

fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(emailData),
})
  .then(async response => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ Response was not JSON:', text);
      throw new Error(`API returned: ${text}`);
    }
  })
  .then(data => {
    if (data.id) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Email ID:', data.id);
      console.log('📨 Check your inbox at:', TO_EMAIL);
    } else if (data.message) {
      console.error('❌ Failed to send email:', data.message);
      if (data.message.includes('domain')) {
        console.error('💡 Tip: Make sure your domain is verified in Resend, or use onboarding@resend.dev as the from address for testing');
      }
    } else {
      console.error('❌ Failed to send email:', data);
    }
  })
  .catch(error => {
    console.error('❌ Error sending email:', error.message);
  });
