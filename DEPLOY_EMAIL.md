# Deploy Welcome Email Function

The welcome email template has been updated with your new design. Follow these steps to deploy it:

## Step 1: Login to Supabase CLI

```bash
npx supabase login
```

Follow the instructions to authenticate with your Supabase account. You'll need to:
1. Visit the URL provided
2. Generate an access token at: https://supabase.com/dashboard/account/tokens
3. Paste the token back in the terminal

## Step 2: Link Your Project

```bash
npx supabase link --project-ref lqmnkdqyoxytyyxuglhx
```

This connects your local codebase to your Supabase project.

## Step 3: Set Up Environment Variables

You need to configure these secrets in Supabase:

```bash
# Required: Resend API key (get from https://resend.com/api-keys)
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional: Customize branding (defaults are already good)
npx supabase secrets set RESEND_FROM_EMAIL="Mommy Milk Bar <welcome@mail.mommymilkbar.nl>"
npx supabase secrets set WELCOME_CTA_URL=https://mommymilkbar.nl/app
npx supabase secrets set APP_STORE_URL=https://mommymilkbar.nl/app
npx supabase secrets set INSTAGRAM_URL=https://www.instagram.com/mommymilkbar/
```

**Getting your Resend API Key:**
1. Go to https://resend.com/api-keys
2. Create or copy your API key (starts with `re_`)
3. Use it in the command above

## Step 4: Deploy the Function

```bash
npx supabase functions deploy send-welcome-email
```

This will upload your updated email template to Supabase.

## Step 5: Test the Email

You can test the email manually:

```bash
npx supabase functions invoke send-welcome-email \
  --data '{"email":"your-test-email@example.com","motherName":"Test User"}'
```

Or just register a new account in your app - the email will be sent automatically!

## What's Changed?

✅ Updated email design to match your CSS specifications
✅ Added the plannenloggenbanner_v2.png image
✅ Refined typography and spacing to match your brand
✅ Improved responsive design for mobile email clients
✅ All images are embedded as base64 (no external hosting needed)

## Email Features

- **Responsive**: Works perfectly on mobile and desktop email clients
- **Professional**: Uses table-based layout for maximum compatibility
- **Branded**: Matches your Poppins font and #F49B9B color scheme
- **Complete**: Includes all sections from your design:
  - Welcome message with Mimi
  - Email activation CTA
  - Feature showcase (Plannen/loggen, Countdown, Planningsoverzicht)
  - App Store download button
  - Instagram link
  - Footer with copyright

## Already Integrated

The email is already integrated with your registration flow in [src/services/auth.service.ts:68-77](src/services/auth.service.ts#L68-L77). New users will automatically receive this email when they sign up!

## Troubleshooting

### "Cannot find project ref"
- Run `npx supabase link --project-ref lqmnkdqyoxytyyxuglhx` first

### "RESEND_API_KEY not configured"
- Make sure you've set the secret: `npx supabase secrets set RESEND_API_KEY=re_xxx`
- Check secrets with: `npx supabase secrets list`

### Email not sending
- Check Supabase logs: Dashboard → Edge Functions → send-welcome-email → Logs
- Verify your Resend API key is valid at https://resend.com/api-keys
- Make sure you've verified your domain in Resend (or use their test domain)

## Need Help?

See the full documentation in [supabase/README.md](supabase/README.md#-edge-function-welkomstmail-via-resend)
