#!/bin/bash

# Deploy and Test Welcome Email Function
# This script deploys the updated email template and sends a test email

echo "🚀 Deploying updated welcome email function..."
echo ""

# Check if logged in
if ! npx supabase projects list &>/dev/null; then
    echo "❌ Not logged in to Supabase."
    echo "Please run: npx supabase login"
    echo "Then get your access token from: https://supabase.com/dashboard/account/tokens"
    exit 1
fi

# Deploy the function
echo "📦 Deploying function to Supabase..."
npx supabase functions deploy send-welcome-email --project-ref lqmnkdqyoxytyyxuglhx

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Function deployed successfully!"
    echo ""
    echo "📧 Sending test email to info@mommymilkbar.nl..."

    # Get the anon key from .env if it exists
    if [ -f .env ]; then
        source .env
    fi

    # Send test email
    curl -X POST 'https://lqmnkdqyoxytyyxuglhx.supabase.co/functions/v1/send-welcome-email' \
      -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
      -H 'Content-Type: application/json' \
      -d '{"email":"info@mommymilkbar.nl","motherName":"Tess"}'

    echo ""
    echo ""
    echo "✅ Test email sent! Check info@mommymilkbar.nl inbox."
else
    echo ""
    echo "❌ Deployment failed. Please check the error above."
    echo ""
    echo "Common issues:"
    echo "1. Not logged in: Run 'npx supabase login'"
    echo "2. Project not linked: Run 'npx supabase link --project-ref lqmnkdqyoxytyyxuglhx'"
    echo "3. Missing RESEND_API_KEY: Run 'npx supabase secrets set RESEND_API_KEY=re_xxxxx'"
    exit 1
fi
