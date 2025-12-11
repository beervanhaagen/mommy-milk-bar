#!/usr/bin/env node

/**
 * Send Test Welcome Email
 * This script sends a test email using Resend API directly
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || 'YOUR_RESEND_API_KEY';
const TO_EMAIL = process.env.TO_EMAIL || 'info@mommymilkbar.nl';
const FROM_EMAIL = 'Mommy Milk Bar <welcome@mail.mommymilkbar.nl>';

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

// Load assets
console.log('📦 Loading email assets...');
const assets = {
  mascot: imageToBase64('supabase/functions/send-welcome-email/assets/mimi_happy.png'),
  banner: imageToBase64('supabase/functions/send-welcome-email/assets/plannenloggenbanner_v2.png'),
  countdown: imageToBase64('supabase/functions/send-welcome-email/assets/iPhone 14 Pro Max_homescr.png'),
  planning: imageToBase64('supabase/functions/send-welcome-email/assets/iPhone 14 Pro Max_Planning.png'),
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
      body { font-family: 'Poppins', 'Helvetica', 'Arial', sans-serif; }
      @media (max-width: 680px) {
        .container { width:100% !important; padding:0 16px !important; }
        .card { padding:24px 20px !important; }
        .content-image { width:90% !important; }
        .hero-title { font-size:20px !important; line-height:28px !important; }
        .section-title { font-size:24px !important; }
        .feature-title { font-size:20px !important; }
        .body-text { font-size:16px !important; line-height:24px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#EAF0F3;font-family:'Poppins','Helvetica','Arial',sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${preheader}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#EAF0F3;font-family:'Poppins','Helvetica','Arial',sans-serif;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table class="container" role="presentation" cellspacing="0" cellpadding="0" width="600" style="width:600px;max-width:100%;">
            <!-- Header with Mimi -->
            <tr>
              <td class="card" style="text-align:center;padding:40px 32px;background:transparent;">
                ${imageTag(assets.mascot, 'Mimi', 'width:100px;height:auto;margin:0 auto 20px;')}
                <h1 class="hero-title" style="margin:0;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:26px;line-height:36px;font-weight:400;color:#000000;">
                  Hi ${displayName},<br/>Welkom bij Mama Milk Bar,<br/>activeer je account.
                </h1>
              </td>
            </tr>

            <!-- Activation Card -->
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="card" style="background:#FFFFFF;border-radius:6px;padding:36px 28px;text-align:center;">
                      <h2 style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:22px;font-weight:700;margin:0 0 12px;color:#000000;">Activeer je email</h2>
                      <p class="body-text" style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;margin:0 auto 24px;max-width:480px;">
                        Je account op Mama Milk Bar is met succes aangemaakt je kan nu met meer vertrouwen voeden na een avond uit!
                      </p>
                      <a href="https://mommymilkbar.nl/app" style="display:inline-block;padding:14px 32px;border-radius:30px;background:#F49B9B;color:#FFFFFF;font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                        Activeer email adres
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Features Card -->
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="card" style="background:#FFFFFF;border-radius:6px;padding:36px 24px;text-align:center;">
                      <h2 class="section-title" style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:26px;font-weight:700;margin:0 0 32px;color:#000000;">Waarom Mama Milk Bar?</h2>

                      <!-- Feature 1: Plannen of loggen -->
                      <div style="margin-bottom:36px;">
                        <h3 class="feature-title" style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:22px;font-weight:700;margin:0 0 12px;color:#000000;">Plannen of loggen</h3>
                        <p class="body-text" style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;margin:0 auto 20px;max-width:460px;">
                          Meteen een drankje loggen of plannen voor later of morgen. Jij doet het op jouw manier.
                        </p>
                        <div class="content-image" style="width:280px;max-width:90%;margin:0 auto;">
                          ${imageTag(assets.banner, 'Plannen of loggen', 'width:100%;height:auto;border-radius:4px;')}
                        </div>
                      </div>

                      <!-- Feature 2: Countdown -->
                      <div style="margin-bottom:36px;">
                        <h3 class="feature-title" style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:22px;font-weight:700;margin:0 0 12px;color:#000000;">Countdown</h3>
                        <p class="body-text" style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;margin:0 auto 20px;max-width:460px;">
                          Je countdown loopt. Wij bewaken de tijd, zodat jij alleen hoeft te genieten.
                        </p>
                        <div class="content-image" style="width:240px;max-width:70%;margin:0 auto;">
                          ${imageTag(assets.countdown, 'Countdown', 'width:100%;height:auto;')}
                        </div>
                      </div>

                      <!-- Feature 3: Planningsoverzicht -->
                      <div style="margin-bottom:32px;">
                        <h3 class="feature-title" style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:22px;font-weight:700;margin:0 0 12px;color:#000000;">Planningsoverzicht</h3>
                        <p class="body-text" style="font-family:'Poppins','Helvetica','Arial',sans-serif;font-size:16px;line-height:24px;font-weight:400;color:#5E5E5E;margin:0 auto 20px;max-width:460px;">
                          Een intuïtief planningsoverzicht van voeden, kolven en drinken, zodat jij met meer vertrouwen en gemak vooruit plant.
                        </p>
                        <div class="content-image" style="width:240px;max-width:70%;margin:0 auto;">
                          ${imageTag(assets.planning, 'Planningsoverzicht', 'width:100%;height:auto;')}
                        </div>
                      </div>

                      <!-- App Store Button -->
                      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E5E5E5;">
                        <a href="https://mommymilkbar.nl/app" style="text-decoration:none;display:inline-block;">
                          ${imageTag(assets.appStore, 'Download in de App Store', 'width:168px;height:auto;')}
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="card" style="text-align:center;padding:28px 20px;font-family:'Poppins','Helvetica','Arial',sans-serif;color:#000000;background:transparent;">
                <div style="margin-bottom:12px;">
                  <a href="https://www.instagram.com/mommymilkbar/" style="display:inline-block;text-decoration:none;">
                    ${imageTag(assets.instagram, 'Volg ons op Instagram', 'width:48px;height:48px;')}
                  </a>
                </div>
                <p style="margin:6px 0;font-size:14px;line-height:18px;font-weight:400;color:#000000;">Copyright © ${new Date().getFullYear()}</p>
                <p style="margin:2px 0;font-size:14px;line-height:18px;font-weight:700;color:#000000;">Mommy Milk Bar</p>
                <p style="margin:2px 0;font-size:14px;line-height:18px;font-weight:400;color:#000000;">Wij helpen je met vertrouwen te genieten</p>
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
  console.error('Please run: RESEND_API_KEY=re_your_key node send-test-email.js');
  process.exit(1);
}

// Send email via Resend API
console.log('📧 Sending test email to:', TO_EMAIL);

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
