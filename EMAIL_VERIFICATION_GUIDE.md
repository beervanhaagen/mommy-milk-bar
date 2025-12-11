# Email Verification System - Implementation Guide

## Overview
This guide explains how to implement email verification for Mommy Milk Bar, why it's important, and how to prevent emails from going to spam.

---

## Why Email Verification is Important

### 1. **Security & Anti-Fraud**
- Confirms the email address belongs to the actual user
- Prevents fake account creation and spam registrations
- Reduces bot registrations

### 2. **Legal Compliance (GDPR/CAN-SPAM)**
- Proves explicit user consent
- Required for marketing emails in EU
- Protects against legal issues

### 3. **Email Deliverability**
- Verified emails = better sender reputation
- Lower spam complaint rates
- Higher inbox delivery rates (not spam folder!)

### 4. **Data Quality**
- Ensures valid, working email addresses
- Reduces bounce rates
- Cleaner user database

---

## Implementation Steps

### Step 1: Database Schema Updates

Add email verification fields to your `users` table (or profiles table):

```sql
-- Add to your Supabase database
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON public.users(email_verification_token);
```

### Step 2: Generate Verification Token on Signup

When a user signs up, generate a unique verification token:

```typescript
import { v4 as uuidv4 } from 'uuid';

// In your signup handler
async function handleSignup(email: string, password: string, motherName: string) {
  // 1. Create user account in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  // 2. Generate verification token
  const verificationToken = uuidv4();

  // 3. Store token in database
  const { error: dbError } = await supabase
    .from('users')
    .update({
      email_verification_token: verificationToken,
      email_verification_sent_at: new Date().toISOString(),
      email_verified: false,
    })
    .eq('id', authData.user.id);

  if (dbError) throw dbError;

  // 4. Send verification email
  await sendVerificationEmail(email, motherName, verificationToken);

  return { success: true };
}
```

### Step 3: Update Email Function to Include Token

Modify the `send-welcome-email` function to accept a verification token:

```typescript
// In supabase/functions/send-welcome-email/index.ts

type SignupPayload = {
  email?: string;
  motherName?: string | null;
  verificationToken?: string;  // ADD THIS
};

serve(async (req: Request): Promise<Response> => {
  // ... existing code ...

  const payload = (await req.json()) as SignupPayload;
  const email = payload.email?.trim().toLowerCase();
  const motherName = payload.motherName?.trim() || null;
  const verificationToken = payload.verificationToken;  // ADD THIS

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is verplicht' }), { status: 400 });
  }

  if (!verificationToken) {
    return new Response(JSON.stringify({ error: 'Verification token is required' }), { status: 400 });
  }

  // Build verification URL
  const verificationUrl = `${Deno.env.get('VERIFICATION_BASE_URL') || 'https://mommymilkbar.nl'}/verify-email?token=${verificationToken}`;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Welkom bij Mommy Milk Bar',
    html: buildEmailHtml(motherName, verificationUrl),  // Pass URL to template
    text: buildEmailText(motherName, verificationUrl),
  });

  // ... rest of code ...
});
```

### Step 4: Create Verification Landing Page

Create a verification page at `/verify-email` in your app:

```typescript
// app/verify-email.tsx (or Next.js/React equivalent)

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Je email wordt geverifieerd...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ongeldige verificatie link.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  async function verifyEmail(token: string) {
    try {
      // Call verification function
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { token },
      });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        setMessage('Je email is succesvol geverifieerd! Je wordt doorgestuurd...');

        // Redirect to app after 2 seconds
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
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
    <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: 'Poppins, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
        {status === 'success' ? '✓ Gelukt!' : status === 'error' ? '⚠ Oeps...' : '⏳ Even geduld...'}
      </h1>
      <p style={{ fontSize: '16px', color: '#5E5E5E' }}>{message}</p>

      {status === 'error' && (
        <a href="/login" style={{ marginTop: '20px', display: 'inline-block', color: '#F49B9B' }}>
          Ga naar inloggen
        </a>
      )}
    </div>
  );
}
```

### Step 5: Create Verification Backend Function

Create a Supabase Edge Function to handle verification:

```typescript
// supabase/functions/verify-email/index.ts

import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Token is verplicht' }),
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user with this token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, email_verified, email_verification_sent_at')
      .eq('email_verification_token', token)
      .single();

    if (findError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Ongeldige of verlopen verificatie link' }),
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email is al geverifieerd' }),
        { status: 200 }
      );
    }

    // Check if token is expired (24 hours)
    const sentAt = new Date(user.email_verification_sent_at);
    const now = new Date();
    const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceSent > 24) {
      return new Response(
        JSON.stringify({ success: false, message: 'Verificatie link is verlopen. Vraag een nieuwe aan.' }),
        { status: 400 }
      );
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        email_verification_token: null, // Clear token
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, message: 'Database fout' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email succesvol geverifieerd!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Onverwachte fout' }),
      { status: 500 }
    );
  }
});
```

---

## Preventing Emails from Going to Spam

### Critical: SPF, DKIM, and DMARC Setup

#### 1. **Use a Custom Domain (NOT @resend.dev)**

First, verify your domain in Resend:
- Go to Resend Dashboard → Domains
- Add your domain: `mommymilkbar.nl`
- You'll receive DNS records to add

#### 2. **Add DNS Records**

Add these TXT records to your domain's DNS (via your domain provider):

```
# SPF Record (Sender Policy Framework)
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

# DKIM Record (from Resend dashboard)
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend - unique to your domain]

# DMARC Record (Domain-based Message Authentication)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@mommymilkbar.nl
```

**How to add DNS records:**
1. Log in to your domain provider (e.g., TransIP, Hostinger, GoDaddy)
2. Find DNS Management or DNS Settings
3. Add TXT records as shown above
4. Wait 24-48 hours for propagation
5. Verify in Resend dashboard

#### 3. **Content Best Practices**

Avoid spam triggers in your emails:
- ❌ Avoid: ALL CAPS IN SUBJECT LINES
- ❌ Avoid: Too many exclamation marks!!!
- ❌ Avoid: Words like "FREE", "WINNER", "URGENT"
- ✅ Use: Professional, clear subject lines
- ✅ Use: Proper HTML structure (already done ✓)
- ✅ Use: Real "from" name and address

#### 4. **Sender Reputation**

Build good sender reputation:
- **Start slow**: Don't send thousands of emails immediately
- **Warm up**: Gradually increase volume over 2-4 weeks
- **Monitor bounces**: Remove invalid emails promptly
- **Honor unsubscribes**: Include unsubscribe link (not needed for transactional emails)
- **High engagement**: Good open rates = better reputation

#### 5. **Email List Hygiene**

- Only send to users who signed up
- Remove hard bounces immediately
- Never buy email lists
- Verify emails exist before sending

### Using Custom Sender Image/Avatar

For the sender profile picture (avatar that appears in Gmail/Outlook):

#### Option 1: BIMI (Brand Indicators for Message Identification)
This is the official way but requires:
- Verified domain with DMARC
- Trademark certificate (expensive!)
- SVG logo file
Not recommended for small businesses initially.

#### Option 2: Gravatar (Simple & Free)
If your from email is Gmail-based:
1. Create account at gravatar.com
2. Upload your logo/mascot image
3. Associate it with welcome@mommymilkbar.nl
4. It will appear automatically in Gmail

#### Option 3: Contact Card (Best for now)
The easiest immediate solution:
1. Send emails from a real email address you control
2. Add that address to your phone contacts with the image
3. Many email clients will sync and show the image

**Recommended Setup:**
```typescript
const fromEmail = 'Mommy Milk Bar <welcome@mommymilkbar.nl>';
```

Then in your email provider (Gmail if using it), set up the profile picture.

---

## Testing Spam Score

Use these tools to test your emails:

1. **Mail Tester** (https://www.mail-tester.com)
   - Send email to provided address
   - Get spam score out of 10
   - See what to fix

2. **GlockApps** (https://glockapps.com)
   - Test inbox delivery across providers
   - See spam filter results

3. **Litmus** (https://www.litmus.com)
   - Preview across email clients
   - Spam testing

---

## Environment Variables Needed

Add to your `.env` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Mommy Milk Bar <welcome@mommymilkbar.nl>

# Verification URLs
VERIFICATION_BASE_URL=https://mommymilkbar.nl

# App URLs
APP_STORE_URL=https://apps.apple.com/your-app
INSTAGRAM_URL=https://www.instagram.com/mommymilkbar/
```

---

## Quick Setup Checklist

- [ ] Add email verification columns to database
- [ ] Generate verification token on signup
- [ ] Update send-welcome-email function to include token
- [ ] Create verify-email Edge Function
- [ ] Create /verify-email landing page in app
- [ ] Set up custom domain in Resend
- [ ] Add SPF/DKIM/DMARC DNS records
- [ ] Test email with mail-tester.com
- [ ] Remove purple heart emoji from subject (✓ Done!)
- [ ] Use higher quality images (✓ Done!)
- [ ] Monitor deliverability and adjust

---

## Need Help?

### Common Issues:

**Q: Emails still going to spam?**
A: Check SPF/DKIM/DMARC records, use mail-tester.com, ensure domain is verified

**Q: Verification link not working?**
A: Check token expiration (24h), verify database updates correctly

**Q: Users not receiving emails?**
A: Check bounces in Resend dashboard, verify email address is valid

---

## Next Steps

1. Implement database changes
2. Update signup flow to generate tokens
3. Deploy verify-email Edge Function
4. Create verification landing page
5. Set up DNS records for spam prevention
6. Test thoroughly before launch!

**Important:** Test the entire flow in development before deploying to production!
